// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import { getCurrentSeasonId } from '@/app/lib/season';

export async function GET() {
  try {
    const supabase = await createServerClientInstance();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const seasonId = await getCurrentSeasonId();

    // SOLO REGISTRATIONS (excluding MUN events and team events)
    // Scoped to current season only — past registrations stay in the DB
    // but are no longer surfaced here, per the simplified profile UX.
    const { data: soloRegs, error: soloError } = await supabase
      .from('registration')
      .select(`
        *,
        events (
          id,
          name,
          description,
          start_date,
          is_team_event,
          registration_fee,
          is_paid
        )
      `)
      .eq('user_id', user.id)
      .eq('season_id', seasonId)
      .is('team_id', null)
      .is('mun_event_id', null)
      .order('registered_at', { ascending: false });

    if (soloError) console.error('Error fetching solo registrations:', soloError);

    // TEAM MEMBERSHIPS
    // team_members itself has no season_id (see earlier decision), so we
    // filter via the joined teams.season_id after the fetch.
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select(`
        *,
        teams (
          id,
          team_name,
          team_code,
          event_id,
          created_by,
          season_id,
          events (
            id,
            name,
            description,
            start_date,
            is_team_event,
            registration_fee,
            is_paid
          )
        )
      `)
      .eq('user_id', user.id);

    if (teamError) console.error('Error fetching team memberships:', teamError);

    // Keep only memberships whose team belongs to the current season
    const currentSeasonTeamMembers = (teamMembers || []).filter(
      (tm: any) => tm.teams?.season_id === seasonId
    );

    // Get members + registration per team
    let teamsWithMembers: any[] = [];
    if (currentSeasonTeamMembers.length > 0) {
      teamsWithMembers = await Promise.all(
        currentSeasonTeamMembers.map(async (tm: any) => {
          const { data: allMembers } = await supabase
            .from('team_members')
            .select(`
              *,
              users (
                id,
                email,
                name
              )
            `)
            .eq('team_id', tm.team_id);

          const { data: teamReg } = await supabase
            .from('registration')
            .select('*')
            .eq('team_id', tm.team_id)
            .maybeSingle();

          return {
            ...tm,
            all_members: allMembers || [],
            registration: teamReg
          };
        })
      );
    }

    // MUN REGISTRATIONS (only MUN events)
    // Also scoped to current season for consistency, even though MUN isn't
    // running this year — keeps this endpoint correct once MUN resumes.
    const { data: munRegistrations, error: munError } = await supabase
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
      .eq('season_id', seasonId)
      .not('mun_event_id', 'is', null)
      .order('registered_at', { ascending: false });

    if (munError) console.error('Error fetching MUN registrations:', munError);

    // COMBINED RESPONSE
    return NextResponse.json({
      user,
      soloRegistrations: soloRegs || [],
      teamMemberships: teamsWithMembers || [],
      munRegistrations: munRegistrations || []
    });
  } catch (err) {
    console.error('Unexpected error in profile API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}