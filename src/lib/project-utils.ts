export function formatProjectExcerpt(description: string, maxLength = 120): string {
  if (description.length <= maxLength) {
    return description;
  }
  return `${description.slice(0, maxLength).trimEnd()}…`;
}

export function sortProjectEntries<T extends { data: { order?: number; title: string } }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.data.title.localeCompare(b.data.title);
  });
}
