// app/api/admin/events/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import { getCurrentSeasonId } from '@/app/lib/season';

export async function GET(request: Request) {
  const supabase = await createServerClientInstance();

  // Check if user is logged in 
  const { data: { user } } = await supabase.auth.getUser();
  let role = null;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    role = profile?.role || null;
  }

  const { searchParams } = new URL(request.url);
  const seasonParam = searchParams.get('season');
  const seasonId = seasonParam === 'all' ? null : seasonParam || (await getCurrentSeasonId());

  let query = supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (seasonId) {
    query = query.eq('season_id', seasonId);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ events: data, role });
}