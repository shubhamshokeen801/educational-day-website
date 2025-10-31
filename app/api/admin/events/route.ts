// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function GET() {
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

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ events: data, role });
}
