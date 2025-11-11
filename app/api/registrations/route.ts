// app/api/registrations/route.ts
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
      portfolio_preference_1,
      portfolio_preference_2,
      ip_category,
      referral_name,
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
      ? { 
          name: Array.isArray(item.events) ? item.events[0]?.name : item.events?.name, 
          is_paid: Array.isArray(item.events) ? item.events[0]?.is_paid : item.events?.is_paid,
          registration_fee: Array.isArray(item.events) ? item.events[0]?.registration_fee : item.events?.registration_fee
        }
      : { 
          name: Array.isArray(item.mun_events) ? item.mun_events[0]?.name : item.mun_events?.name,
          registration_fee: Array.isArray(item.mun_events) ? item.mun_events[0]?.registration_fee : item.mun_events?.registration_fee
        };

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
      portfolio_preference_1: item.portfolio_preference_1,
      portfolio_preference_2: item.portfolio_preference_2,
      ip_category: item.ip_category,
      referral_name: item.referral_name,
      event_type: item.mun_event_id ? 'mun' : 'regular',
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
  const { id, payment_verification, status, send_email } = body;

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
  .select(`
    *,
    users:user_id (name, email),
    teams:team_id (
      team_name,
      team_members (
        role,
        users (name, email)
      )
    ),
    events:event_id (name),
    mun_events:mun_event_id (name)
  `)
  .single();

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send email if requested and payment verification is approved
if (send_email && payment_verification === 'verified') {
  try {
    let recipientEmail = '';
    let recipientName = '';
    
    if (data.team_id) {
      // For team registrations, find the leader's email
      const leader = data.teams?.team_members?.find((tm: any) => tm.role === 'leader');
      recipientEmail = leader?.users?.email || '';
      recipientName = leader?.users?.name || 'Team Leader';
    } else {
      // For solo registrations
      recipientEmail = data.users?.email || '';
      recipientName = data.users?.name || '';
    }

    const eventName = data.events?.name || data.mun_events?.name || 'Event';
    const isTeam = !!data.team_id;
    const teamName = data.teams?.team_name;

    if (recipientEmail) {
      const { sendEmail, emailTemplates } = await import('@/app/lib/emailService');
      const emailContent = emailTemplates.paymentVerified(
        recipientName, 
        eventName, 
        isTeam, 
        teamName
      );
      
      await sendEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Don't fail the update if email fails
  }
}

  return NextResponse.json(data);
}

// app/api/registrations/route.ts - Add this DELETE handler after the PATCH handler

export async function DELETE(request: Request) {
  const supabase = await createServerClientInstance();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
  }

  try {
    // First, get the registration to check if it's a team registration
    const { data: registration, error: fetchError } = await supabase
      .from('registration')
      .select('team_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (registration.team_id) {
      // Team registration - delete the team (cascade will handle the rest)
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', registration.team_id);

      if (deleteError) {
        console.error('Team delete error:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    } else {
      // Solo registration - delete directly
      const { error: deleteError } = await supabase
        .from('registration')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Registration delete error:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Delete operation failed' }, { status: 500 });
  }
}