import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

// helper: generate 6-char team code
function genCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { eventId, teamName, phoneNumber } = body;
  
  // Validate phone number
  if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
    return NextResponse.json(
      { error: 'Valid 10-digit phone number is required' }, 
      { status: 400 }
    );
  }
  
  const supabase = await createServerClientInstance();

  // verify user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // load event
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  // check registration open
  if (!event.registration_open)
    return NextResponse.json({ error: "Registrations are closed." }, { status: 400 });

  // ensure team events allowed
  if (!event.is_team_event) {
    return NextResponse.json({ error: 'Event does not allow teams' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to verify existing teams' }, { status: 500 });
  }

  if (existingTeam) {
    return NextResponse.json(
      { error: 'You have already created a team for this event.' },
      { status: 400 }
    );
  }

  // generate unique team code (retry up to 5 times)
  let code = genCode();
  for (let i = 0; i < 5; i++) {
    const { data: existingCode } = await supabase
      .from('teams')
      .select('id')
      .eq('team_code', code)
      .maybeSingle();
    if (!existingCode) break;
    code = genCode();
  }

  // create team
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({
      event_id: eventId,
      team_name: teamName,
      team_code: code,
      created_by: user.id
    })
    .select()
    .single();

  if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 });

  // add leader to team_members
  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    role: 'leader'
  });

  // create registration for the team (leader pays) with phone number
  const { data: reg, error: regErr } = await supabase
    .from('registration')
    .insert({
      event_id: eventId,
      team_id: team.id,
      phone_number: phoneNumber,
      payment_status: 'pending',
      registered_at: new Date().toISOString()
    })
    .select()
    .single();

  if (regErr) return NextResponse.json({ error: regErr.message }, { status: 500 });

  return NextResponse.json({ team, registration: reg });
}