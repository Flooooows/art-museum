/** Keep navigation bounded even when the collection spans hundreds of pages. */
export function paginationPages(
  current: number,
  total: number,
): (number | null)[] {
  const count = Math.max(1, Math.floor(total));
  const page = Math.max(1, Math.min(count, Math.floor(current)));
  const selected = new Set(
    [1, count, page - 1, page, page + 1].filter((n) => n >= 1 && n <= count),
  );
  const result: (number | null)[] = [];
  for (const n of [...selected].sort((a, b) => a - b)) {
    const previous = result.at(-1);
    if (typeof previous === "number" && n - previous > 1) result.push(null);
    result.push(n);
  }
  return result;
}
