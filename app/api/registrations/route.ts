import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function GET() {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from('registration')
    .select(`
      id,
      payment_status,
      payment_verification,
      status,
      registered_at,
      user_id,
      team_id,
      phone_number,
      institute_name,
      qualification,
      payment_proof_url,
      event_id,
      mun_event_id,
      users:user_id (name, email),
      teams:team_id (
        team_name, 
        team_code,
        created_by,
        team_members (
          user_id,
          role,
          users (name, email),
          phone_number
        )
      ),
      events:event_id (name, is_paid, registration_fee),
      mun_events:mun_event_id (name, registration_fee)
    `)
    .order('registered_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format the data
  const formatted = (data || []).map((item: any) => {
    const team = Array.isArray(item.teams) ? item.teams[0] : item.teams;

    const teamMembers =
      team?.team_members?.map((tm: any) => ({
        name: tm.users?.name || 'Unknown',
        email: tm.users?.email || '',
        phone_number: tm.phone_number || '',
        user_id: tm.user_id,
        role: tm.role,
      })) || [];

    let leaderEmail = '';
    if (team) {
      const leader = teamMembers.find((m: any) => m.role === 'leader');
      if (leader) leaderEmail = leader.email;
    }

    // Determine event info (regular or MUN)
    const eventInfo = item.events 
      ? { name: Array.isArray(item.events) ? item.events[0]?.name : item.events?.name, type: 'regular' }
      : { name: Array.isArray(item.mun_events) ? item.mun_events[0]?.name : item.mun_events?.name, type: 'mun' };

    return {
      id: item.id,
      payment_status: item.payment_status || 'pending',
      payment_verification: item.payment_verification || 'pending',
      status: item.status || 'pending',
      registered_at: item.registered_at,
      user_id: item.user_id,
      team_id: item.team_id,
      phone_number: item.phone_number,
      institute_name: item.institute_name,
      qualification: item.qualification,
      payment_proof_url: item.payment_proof_url,
      event_type: eventInfo.type,
      events: eventInfo,
      teams: team
        ? {
            ...team,
            team_members: undefined,
            leader_email: leaderEmail,
          }
        : null,
      users: Array.isArray(item.users) ? item.users[0] : item.users,
      team_members: teamMembers,
    };
  });

  return NextResponse.json(formatted);
}

export async function PATCH(request: Request) {
  const supabase = await createServerClientInstance();
  const body = await request.json();
  const { id, payment_verification, status } = body;

  if (!id) {
    return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
  }

  const updateData: any = {};
  if (payment_verification !== undefined) updateData.payment_verification = payment_verification;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from('registration')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}