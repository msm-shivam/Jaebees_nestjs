/**
 * Converts a string to a URL-safe slug.
 * Example: "Nike Air Max 2026" → "nike-air-max-2026"
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except hyphens
    .replace(/[\s_]+/g, '-') // spaces/underscores → hyphen
    .replace(/--+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
