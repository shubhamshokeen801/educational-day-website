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
 * Find an event by slug from a list of events
 * @param events - Array of events with name property
 * @param slug - The slug to match
 * @returns The matching event or undefined
 */
export function findEventBySlug<T extends { name: string }>(
  events: T[],
  slug: string
): T | undefined {
  return events.find(event => generateSlug(event.name) === slug);
}