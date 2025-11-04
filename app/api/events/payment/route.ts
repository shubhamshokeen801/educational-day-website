// app/api/events/payment/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

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

    // Check if registration exists and belongs to user or user's team
    const { data: registration, error: regErr } = await supabase
      .from('registration')
      .select(`
        *,
        events(id, name, is_paid, registration_fee),
        teams(id, team_name, created_by)
      `)
      .eq('id', registrationId)
      .not('event_id', 'is', null)
      .is('mun_event_id', null)
      .maybeSingle();

    if (regErr) {
      console.error('Error fetching registration:', regErr);
      return NextResponse.json(
        { error: 'Error fetching registration' },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if this is a paid event
    if (!registration.events?.is_paid) {
      return NextResponse.json(
        { error: 'This is a free event. Payment is not required.' },
        { status: 400 }
      );
    }

    // For team registrations, verify user is the team leader
    if (registration.team_id) {
      if (registration.teams?.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Only the team leader can upload payment proof' },
          { status: 403 }
        );
      }
    } else {
      // For solo registrations, verify user owns the registration
      if (registration.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to upload payment for this registration' },
          { status: 403 }
        );
      }
    }

    // If payment already verified/approved, don't allow re-upload
    if (registration.payment_status === 'verified' || registration.payment_status === 'approved') {
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

    const { error: uploadErr } = await supabase.storage
      .from('event-payments')
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
      .from('event-payments')
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

    return NextResponse.json({
      success: true,
      registration: updatedReg,
      message: 'Payment proof uploaded successfully! Your registration will be verified within 24-48 hours.',
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