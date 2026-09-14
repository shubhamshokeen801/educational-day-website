// app/lib/season.ts
import { createServerClientInstance } from './supabaseServerClient';

export interface Season {
  id: string;
  year: number;
  label: string;
  is_current: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

/**
 * Fetches the season flagged `is_current = true`. If none is set (a config
 * mistake, not a normal state), falls back to the most recent season by year
 * so the app keeps functioning, and logs loudly so the misconfiguration gets
 * fixed at the `seasons` table rather than every caller needing to handle it.
 */
export async function getCurrentSeason(): Promise<Season> {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_current', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current season:', error);
    throw new Error('Failed to fetch current season');
  }

  if (data) return data as Season;

  console.error(
    'No season has is_current = true. Falling back to most recent season by year. Fix this in the `seasons` table.'
  );

  const { data: fallback, error: fallbackError } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fallbackError || !fallback) {
    console.error('Fallback season lookup also failed:', fallbackError);
    throw new Error('No seasons exist in the database.');
  }

  return fallback as Season;
}

export async function getCurrentSeasonId(): Promise<string> {
  const season = await getCurrentSeason();
  return season.id;
}

export async function getAllSeasons(): Promise<Season[]> {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching seasons:', error);
    throw new Error('Failed to fetch seasons');
  }

  return (data || []) as Season[];
}

export async function getSeasonById(seasonId: string): Promise<Season | null> {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', seasonId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching season by id:', error);
    throw new Error('Failed to fetch season');
  }

  return data as Season | null;
}