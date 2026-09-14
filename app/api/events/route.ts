import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import { getCurrentSeasonId } from '@/app/lib/season';

export async function GET() {
  const supabase = await createServerClientInstance();
  const seasonId = await getCurrentSeasonId();

  // Fetch both regular events and MUN events, scoped to the current season
  const [regularEvents, munEvents] = await Promise.all([
    supabase
      .from('events')
      .select('id, name')
      .eq('season_id', seasonId)
      .order('name', { ascending: true }),
    supabase
      .from('mun_events')
      .select('id, name')
      .eq('season_id', seasonId)
      .order('name', { ascending: true })
  ]);

  if (regularEvents.error) {
    console.error('Regular events error:', regularEvents.error);
    return NextResponse.json({ error: regularEvents.error.message }, { status: 500 });
  }

  if (munEvents.error) {
    console.error('MUN events error:', munEvents.error);
    return NextResponse.json({ error: munEvents.error.message }, { status: 500 });
  }

  // Combine and mark event types
  const allEvents = [
    ...(regularEvents.data || []).map(e => ({ ...e, type: 'regular' })),
    ...(munEvents.data || []).map(e => ({ ...e, type: 'mun' }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(allEvents);
}