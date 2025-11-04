// app/api/team/create/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

// Helper: generate 6-char team code
function generateTeamCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, teamName, phoneNumber } = body;
    
    // Validate required fields
    if (!eventId || !teamName || !phoneNumber) {
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

    // Load event
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

    // Ensure event allows team registration
    if (!event.is_team_event) {
      return NextResponse.json(
        { error: 'This event does not allow team registration. Please register as solo.' }, 
        { status: 400 }
      );
    }

    // Check if user already created a team for this event
    const { data: existingTeam, error: existingErr } = await supabase
      .from('teams')
      .select('id, event_id')
      .eq('created_by', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingErr) {
      console.error('Error checking existing team:', existingErr);
      return NextResponse.json(
        { error: 'Failed to verify existing teams' }, 
        { status: 500 }
      );
    }

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You have already created a team for this event.' },
        { status: 400 }
      );
    }

    // Check if user is already part of another team for this event
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
          error: 'You are already part of another team for this event.',
        }, { status: 400 });
      }
    }

    // Generate unique team code (retry up to 5 times)
    let teamCode = generateTeamCode();
    for (let i = 0; i < 5; i++) {
      const { data: existingCode } = await supabase
        .from('teams')
        .select('id')
        .eq('team_code', teamCode)
        .maybeSingle();
      
      if (!existingCode) break;
      teamCode = generateTeamCode();
    }

    // Create team
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({
        event_id: eventId,
        team_name: teamName,
        team_code: teamCode,
        created_by: user.id
      })
      .select()
      .single();

    if (teamErr) {
      console.error('Error creating team:', teamErr);
      return NextResponse.json(
        { error: teamErr.message }, 
        { status: 500 }
      );
    }

    // Add leader to team_members with phone number
    const { error: memberErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'leader',
        phone_number: phoneNumber,
      });

    if (memberErr) {
      console.error('Error adding team leader:', memberErr);
      return NextResponse.json(
        { error: 'Failed to add team leader' }, 
        { status: 500 }
      );
    }

    // Determine payment status based on event type
    const paymentStatus = event.is_paid ? 'pending' : 'verified';
    const registrationStatus = event.is_paid ? 'pending' : 'verified';

    // Create registration for the team (leader is responsible for payment)
    const { data: reg, error: regErr } = await supabase
      .from('registration')
      .insert({
        event_id: eventId,
        team_id: team.id,
        user_id: user.id, // Team leader's user_id for tracking
        phone_number: phoneNumber,
        payment_status: paymentStatus,
        status: registrationStatus,
        registered_at: new Date().toISOString()
      })
      .select()
      .single();

    if (regErr) {
      console.error('Error creating registration:', regErr);
      return NextResponse.json(
        { error: regErr.message }, 
        { status: 500 }
      );
    }

    // Return appropriate message based on payment requirement
    const message = event.is_paid 
      ? `Team created successfully! Share code "${teamCode}" with your team members. As team leader, please complete payment to confirm registration.`
      : `Team created successfully! Share code "${teamCode}" with your team members.`;

    return NextResponse.json({
      success: true,
      team,
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