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
      qualification,
      referralName,
      portfolioPreference1,
      portfolioPreference2,
      ipCategory
    } = body;
    
    // Validate required fields
    if (!munEventId || !phoneNumber || !instituteName || !qualification) {
      return NextResponse.json(
        { error: 'All required fields must be filled' }, 
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

    // Check if MUN event exists and get event details
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

    // Get event name to determine required fields
    const eventName = munEvent.name.toUpperCase();

    // Helper function to check if event is exactly IP (not AIPPM)
    const isIPEvent = (name: string) => {
      // Check if it's IP but NOT AIPPM
      return name.includes('IP') && !name.includes('AIPPM');
    };

    // Event-specific validation based on event name
    if (eventName.includes('WHO') || eventName.includes('AIPPM')) {
      if (!portfolioPreference1 || !portfolioPreference2) {
        return NextResponse.json(
          { error: 'Both portfolio preferences are required for this event' }, 
          { status: 400 }
        );
      }
      if (portfolioPreference1.trim() === portfolioPreference2.trim()) {
        return NextResponse.json(
          { error: 'Portfolio preferences must be different' }, 
          { status: 400 }
        );
      }
    }

    if (isIPEvent(eventName)) {
      if (!ipCategory || !['Journalism', 'Photography'].includes(ipCategory)) {
        return NextResponse.json(
          { error: 'Valid IP category is required (Journalism or Photography)' }, 
          { status: 400 }
        );
      }
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

    // Prepare registration data
    const registrationData: any = {
      mun_event_id: munEventId,
      user_id: user.id,
      phone_number: phoneNumber,
      institute_name: instituteName,
      qualification: qualification,
      payment_status: 'pending',
      status: 'pending',
      registered_at: new Date().toISOString(),
    };

    // Add referral name in uppercase if provided
    if (referralName && referralName.trim()) {
      registrationData.referral_name = referralName.trim().toUpperCase();
    }

    // Add event-specific fields based on event name
    if (eventName.includes('WHO') || eventName.includes('AIPPM')) {
      registrationData.portfolio_preference_1 = portfolioPreference1.trim();
      registrationData.portfolio_preference_2 = portfolioPreference2.trim();
    }

    if (isIPEvent(eventName)) {
      registrationData.ip_category = ipCategory;
    }

    // Create MUN registration
    const { data: registration, error: regErr } = await supabase
      .from('registration')
      .insert(registrationData)
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