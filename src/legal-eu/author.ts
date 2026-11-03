/** Institutional search fields can encode periods of activity, not actual deaths. */
export function certainInstitutionalDeathYear(
  value: unknown,
  description: string,
): number | null {
  if (typeof value !== "string" || !/^\d{4}$/.test(value)) return null;
  if (
    /\b(active|flourished|floruit)\b/i.test(description) ||
    /\?/.test(description)
  )
    return null;
  const approximateDeath = new RegExp(
    `(?:\\bc\\.|\\bca\\.|\\bcirca|\\bbefore|\\bafter|\\babout|\\bvers|\\bavant|\\baprès)\\s*${value}\\b`,
    "i",
  );
  return approximateDeath.test(description) ? null : Number(value);
}
