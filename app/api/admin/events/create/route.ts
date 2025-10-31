// app/api/admin/events/create/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    description,
    is_team_event = false,
    max_team_size = null,
    min_team_size = null,
    start_date,
    end_date,
  } = body;

  if (!name || !start_date || !end_date) {
    return NextResponse.json(
      { error: 'Missing required fields (name, start_date, end_date)' },
      { status: 400 }
    );
  }

  const supabase = await createServerClientInstance();

  // Verify user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Check admin privileges
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr)
    return NextResponse.json({ error: 'Error fetching user role' }, { status: 500 });

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied. Admins only.' }, { status: 403 });
  }

  // Create event
  const { data, error } = await supabase
    .from('events')
    .insert({
      name,
      description,
      is_team_event,
      max_team_size,
      min_team_size,
      start_date,
      end_date,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: 'Event created successfully', event: data });
}
