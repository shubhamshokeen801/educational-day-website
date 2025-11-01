import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamCode, phoneNumber } = body;
    
    if (!teamCode) {
      return NextResponse.json({ error: 'teamCode is required' }, { status: 400 });
    }
    
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
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Find team by code
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*')
      .eq('team_code', teamCode)
      .maybeSingle();

    if (teamErr) return NextResponse.json({ error: 'Error fetching team' }, { status: 500 });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    // Get event data
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', team.event_id)
      .maybeSingle();

    if (eventErr) return NextResponse.json({ error: 'Error fetching event' }, { status: 500 });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    
    // check registration open
    if (!event.registration_open)
      return NextResponse.json({ error: "Registrations are closed." }, { status: 400 });

    // Check if user already registered (solo)
    const { data: soloReg } = await supabase
      .from('registration')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (soloReg) {
      return NextResponse.json(
        { error: 'You are already registered solo for this event.' },
        { status: 400 }
      );
    }

    // Check if user already joined another team for this event
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (userTeams && userTeams.length > 0) {
      const teamIds = userTeams.map((t) => t.team_id);

      const { data: eventTeams } = await supabase
        .from('teams')
        .select('id')
        .in('id', teamIds)
        .eq('event_id', event.id);

      if (eventTeams && eventTeams.length > 0) {
        return NextResponse.json(
          { error: 'You already belong to another team for this event.' },
          { status: 400 }
        );
      }
    }

    // Check if already a member of this team
    const { data: alreadyMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (alreadyMember) {
      return NextResponse.json(
        { error: 'You are already a member of this team.' },
        { status: 400 }
      );
    }

    // Check if team is full
    if (event.max_team_size) {
      const { data: members, error: membersErr } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id);

      if (membersErr)
        return NextResponse.json({ error: 'Error checking team size' }, { status: 500 });

      if (members && members.length >= event.max_team_size) {
        return NextResponse.json({ error: 'Team is already full.' }, { status: 400 });
      }
    }

    // Verify that the team has a registration (created by leader)
    const { data: teamRegistration } = await supabase
      .from('registration')
      .select('*')
      .eq('team_id', team.id)
      .maybeSingle();

    if (!teamRegistration) {
      return NextResponse.json(
        { error: 'Team registration not found. Please contact the team leader.' },
        { status: 400 }
      );
    }

    // Check if leader has paid (optional check)
    if (teamRegistration.payment_status !== 'completed') {
      // You can optionally allow joining even if payment is pending
      // Or you can enforce payment first - uncomment below to enforce:
      /*
      return NextResponse.json(
        { error: 'Team registration payment is pending. Please wait for team leader to complete payment.' },
        { status: 400 }
      );
      */
    }

    // Add member with phone number (NO registration creation - only join team_members)
    const { data: newMember, error: joinErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'member',
        phone_number: phoneNumber,
      })
      .select()
      .single();

    if (joinErr) {
      console.error('Error joining team:', joinErr);
      return NextResponse.json({ error: joinErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      team,
      member: newMember,
      message: 'Successfully joined the team! The team leader will handle payment.',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}