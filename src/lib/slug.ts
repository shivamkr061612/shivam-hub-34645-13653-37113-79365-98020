// Slug utilities for SEO-friendly URLs
// Generates clean slugs from item names: "FILMORA PRO" -> "filmora-pro"

export function generateSlug(input: string): string {
  if (!input) return 'item';
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, ' ')   // remove special chars
    .trim()
    .replace(/\s+/g, '-')             // spaces -> hyphens
    .replace(/-+/g, '-')              // collapse hyphens
    .replace(/^-+|-+$/g, '')          // trim hyphens
    .slice(0, 80) || 'item';
}

// Returns the slug to use for an item — prefers stored slug, falls back to generated
export function getItemSlug(item: any): string {
  if (!item) return 'item';
  if (item.slug && typeof item.slug === 'string' && item.slug.length > 0) {
    return item.slug;
  }
  return generateSlug(item.title || item.name || item.id || 'item');
}

// Find an item in a list by matching slug (stored OR generated from title)
// Falls back to id match for backward compatibility with old URLs
export function findItemBySlug<T extends { id: string; title?: string; slug?: string }>(
  items: T[],
  slug: string
): T | undefined {
  if (!items || !slug) return undefined;
  const target = slug.toLowerCase();

  // 1. exact stored slug
  let found = items.find((i) => (i.slug || '').toLowerCase() === target);
  if (found) return found;

  // 2. generated slug from title
  found = items.find((i) => generateSlug(i.title || '') === target);
  if (found) return found;

  // 3. legacy: slug param is actually a Firebase doc id
  found = items.find((i) => i.id === slug);
  return found;
}
