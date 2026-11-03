/** Do not mistake a date in a book's title for the date of its publication. */
export function historicalIllustration(
  citation: string,
  asOf: string,
): boolean {
  if (!/\bill\b|reprodu|\bfig\b/i.test(citation)) return false;
  const years = [...citation.matchAll(/\b([12]\d{3})\b/g)].map((m) =>
    Number(m[1]),
  );
  if (!years.length || Math.max(...years) + 26 > Number(asOf.slice(0, 4)))
    return false;
  // Require an explicit bibliographical year position, not just a historical subject.
  return (
    /^\s*(?:18|19)\d{2}\s/.test(citation) ||
    /,\s*(?:18|19)\d{2}\s*(?:[,.]\s*(?:p\.|pp\.|ill\.|reprodu|fig\.)|\.)/i.test(
      citation,
    )
  );
}
