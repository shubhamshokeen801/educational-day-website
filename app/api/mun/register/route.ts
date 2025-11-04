// app/api/mun/register/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      munEventId, 
      phoneNumber, 
      instituteName, 
      qualification
    } = body;
    
    // Validate required fields
    if (!munEventId || !phoneNumber || !instituteName || !qualification) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      );
    }
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Valid 10-digit phone number is required' }, 
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

    // Check if MUN event exists
    const { data: munEvent, error: eventErr } = await supabase
      .from('mun_events')
      .select('*')
      .eq('id', munEventId)
      .maybeSingle();

    if (eventErr) {
      return NextResponse.json(
        { error: 'Error fetching MUN event' }, 
        { status: 500 }
      );
    }

    if (!munEvent) {
      return NextResponse.json(
        { error: 'MUN Event not found' }, 
        { status: 404 }
      );
    }
    
    // Check if registration is open
    if (!munEvent.registration_open) {
      return NextResponse.json(
        { error: 'Registrations are closed for this event' }, 
        { status: 400 }
      );
    }

    // Check if user already registered for this MUN event
    const { data: existingReg } = await supabase
      .from('registration')
      .select('id')
      .eq('mun_event_id', munEventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingReg) {
      return NextResponse.json(
        { error: 'You are already registered for this MUN event' },
        { status: 400 }
      );
    }

    // Create MUN registration in the unified registration table
    const { data: registration, error: regErr } = await supabase
      .from('registration')
      .insert({
        mun_event_id: munEventId,
        user_id: user.id,
        phone_number: phoneNumber,
        institute_name: instituteName,
        qualification: qualification,
        payment_status: 'pending',
        status: 'pending',
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (regErr) {
      console.error('Error creating MUN registration:', regErr);
      return NextResponse.json(
        { error: regErr.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registration,
      message: 'Successfully registered for MUN event! Please complete payment to confirm your registration.',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's MUN registrations
export async function GET(req: Request) {
  try {
    const supabase = await createServerClientInstance();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const { data: registrations, error } = await supabase
      .from('registration')
      .select(`
        *,
        mun_events (
          id,
          name,
          description,
          event_datetime,
          image_url,
          registration_fee
        )
      `)
      .eq('user_id', user.id)
      .not('mun_event_id', 'is', null)
      .order('registered_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json(registrations || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}