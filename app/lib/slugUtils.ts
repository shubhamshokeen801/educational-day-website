// app/lib/slugUtils.ts

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Find an event by slug from a list of events.
 * If `seasonId` is provided, only events matching that season are eligible —
 * this is what prevents two events sharing a name across different years
 * from colliding on the same slug. Pass the events pre-fetched for the
 * relevant season (or unfiltered + seasonId, either works since this only
 * filters, it doesn't fetch).
 * @param events - Array of events with name (and optionally season_id) property
 * @param slug - The slug to match
 * @param seasonId - Optional season id to restrict the match to
 * @returns The matching event or undefined
 */
export function findEventBySlug<T extends { name: string; season_id?: string }>(
  events: T[],
  slug: string,
  seasonId?: string
): T | undefined {
  const pool = seasonId
    ? events.filter(event => event.season_id === seasonId)
    : events;

  return pool.find(event => generateSlug(event.name) === slug);
}