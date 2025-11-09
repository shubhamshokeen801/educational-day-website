// app/api/mun/payment/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import { sendEmail, emailTemplates } from '@/app/lib/emailService';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const registrationId = formData.get('registrationId') as string;
    const paymentProof = formData.get('paymentProof') as File;

    // Validate required fields
    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    if (!paymentProof) {
      return NextResponse.json(
        { error: 'Payment proof is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(paymentProof.type)) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (paymentProof.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const supabase = await createServerClientInstance();

    // Verify user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    // Check if registration exists and belongs to user
    const { data: registration, error: regErr } = await supabase
      .from('registration')
      .select('*, mun_events(id, name)')
      .eq('id', registrationId)
      .eq('user_id', user.id)
      .not('mun_event_id', 'is', null)
      .maybeSingle();

    if (regErr) {
      return NextResponse.json(
        { error: 'Error fetching registration' },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found or unauthorized' },
        { status: 404 }
      );
    }

    // If payment already verified, don't allow re-upload
    if (registration.payment_status === 'verified') {
      return NextResponse.json(
        { error: 'Payment has already been verified for this registration' },
        { status: 400 }
      );
    }

    // Upload payment proof to Supabase Storage
    const fileExt = paymentProof.name.split('.').pop();
    const fileName = `${user.id}_${registrationId}_${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    const arrayBuffer = await paymentProof.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('mun-payments')
      .upload(filePath, buffer, {
        contentType: paymentProof.type,
        upsert: false
      });

    if (uploadErr) {
      console.error('Error uploading payment proof:', uploadErr);
      return NextResponse.json(
        { error: 'Failed to upload payment proof' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('mun-payments')
      .getPublicUrl(filePath);

    // Update registration with payment proof and status
    const { data: updatedReg, error: updateErr } = await supabase
      .from('registration')
      .update({
        payment_proof_url: publicUrl,
        payment_status: 'verified',
        status: 'pending'
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating registration:', updateErr);
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      );
    }

    // Send payment confirmation email
    if (userData?.email && registration.mun_events) {
      const emailTemplate = emailTemplates.munPaymentUploaded(
        userData.name,
        registration.mun_events.name
      );
      
      await sendEmail({
        to: userData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    return NextResponse.json({
      success: true,
      registration: updatedReg,
      message: 'Payment proof uploaded successfully! Check your email for confirmation.',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch payment status for a registration
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClientInstance();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: registration, error } = await supabase
      .from('registration')
      .select('payment_status, payment_proof_url, status')
      .eq('id', registrationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}