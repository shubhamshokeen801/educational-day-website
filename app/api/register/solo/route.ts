// app/api/register/solo/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import { sendEmail, emailTemplates } from '@/app/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, phoneNumber } = body;
    
    // Validate phone number
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
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
        { error: 'Sign in to register for event' }, 
        { status: 401 }
      );
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    // Check if event exists
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (eventErr) {
      return NextResponse.json(
        { error: 'Error fetching event' }, 
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' }, 
        { status: 404 }
      );
    }

    // Check if registration is open
    if (!event.registration_open) {
      return NextResponse.json(
        { error: 'Registrations are closed for this event' }, 
        { status: 400 }
      );
    }

    // Check if event is a team event (solo registration not allowed)
    if (event.is_team_event) {
      return NextResponse.json(
        { error: 'This is a team event. Please create or join a team to register.' }, 
        { status: 400 }
      );
    }

    // Check if user already has a solo registration
    const { data: existing } = await supabase
      .from('registration')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .is('team_id', null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You are already registered for this event' }, 
        { status: 400 }
      );
    }

    // Check if user is part of a team for this event
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (userTeams && userTeams.length > 0) {
      const teamIds = userTeams.map((t) => t.team_id);
      const { data: teamsForEvent } = await supabase
        .from('teams')
        .select('id')
        .in('id', teamIds)
        .eq('event_id', eventId);

      if (teamsForEvent && teamsForEvent.length > 0) {
        return NextResponse.json({
          error: 'You are already registered as a team member for this event.',
        }, { status: 400 });
      }
    }

    // Determine payment status based on event type
    const paymentStatus = event.is_paid ? 'pending' : 'verified';
    const registrationStatus = event.is_paid ? 'pending' : 'verified';

    // Insert new solo registration
    const { data: reg, error: regError } = await supabase
      .from('registration')
      .insert({
        event_id: eventId,
        user_id: user.id,
        phone_number: phoneNumber,
        payment_status: paymentStatus,
        status: registrationStatus,
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (regError) {
      console.error('Error creating registration:', regError);
      return NextResponse.json(
        { error: regError.message }, 
        { status: 500 }
      );
    }

    // Send confirmation email
    if (userData?.email) {
      const emailTemplate = emailTemplates.soloRegistration(
        userData.name,
        event.name,
        event.is_paid,
        event.registration_fee
      );
      
      await sendEmail({
        to: userData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    // Return appropriate message based on payment requirement
    const message = event.is_paid 
      ? 'Successfully registered! Please complete payment to confirm your registration.'
      : 'Successfully registered for the event!';

    return NextResponse.json({
      success: true,
      registration: reg,
      requiresPayment: event.is_paid,
      registrationFee: event.registration_fee,
      message,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}