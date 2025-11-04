// app/api/mun/events/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import { generateSlug } from '@/app/lib/slugUtils';

export async function GET(req: Request) {
  try {
    const supabase = await createServerClientInstance();

    const { data: munEvents, error } = await supabase
      .from('mun_events')
      .select('*')
      .order('event_datetime', { ascending: true });

    if (error) {
      console.error('Error fetching MUN events:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Add slug to each event for frontend use
    const eventsWithSlug = munEvents?.map(event => ({
      ...event,
      slug: generateSlug(event.name)
    })) || [];

    return NextResponse.json(eventsWithSlug);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}