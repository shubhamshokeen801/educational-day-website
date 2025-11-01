import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function POST(req: Request) {
  const { eventId, phoneNumber } = await req.json();
  
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
  if (!user)
    return NextResponse.json({ error: 'Signin to register in event' }, { status: 401 });

  // Check if event exists and allows solo/team registration
  const { data: event, error: eventErr } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (eventErr) return NextResponse.json({ error: 'Error fetching event' }, { status: 500 });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  // Check registration open for event
  if (!event.registration_open)
    return NextResponse.json({ error: "Registrations are closed." }, { status: 400 });

  // If event allows team registration, ensure user is not part of any team for this event
  if (event.is_team_event) {
    const { data: userTeams, error: teamCheckErr } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (teamCheckErr)
      return NextResponse.json({ error: 'Error checking team membership' }, { status: 500 });

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
  }

  // Check if user already has a solo registration
  const { data: existing } = await supabase
    .from('registration')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing)
    return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });

  // Insert new solo registration with phone number
  const { data: reg, error } = await supabase
    .from('registration')
    .insert({
      event_id: eventId,
      user_id: user.id,
      phone_number: phoneNumber,
      payment_status: 'pending',
      registered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ registration: reg });
}