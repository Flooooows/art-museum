export interface IdentityCandidate {
  id: string;
  title: string;
  creator: string;
  institution: string;
  yearStart: number | null;
  yearEnd: number | null;
  externalIds: { provider: string; id: string }[];
  kind: "work" | "series" | "reproduction";
}
const normalized = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Search hits are candidates, never evidence for the target until matched. */
export function resolveIdentity(
  target: IdentityCandidate,
  candidates: IdentityCandidate[],
) {
  const matches = candidates.filter((candidate) => {
    if (candidate.kind !== "work") return false;
    const exactId = candidate.externalIds.some((id) =>
      target.externalIds.some(
        (expected) =>
          expected.provider === id.provider && expected.id === id.id,
      ),
    );
    if (exactId)
      return (
        normalized(candidate.institution) === normalized(target.institution)
      );
    const title = normalized(candidate.title) === normalized(target.title);
    const creator =
      !!target.creator.trim() &&
      normalized(candidate.creator) === normalized(target.creator);
    const institution =
      !!target.institution.trim() &&
      normalized(candidate.institution) === normalized(target.institution);
    const dates =
      [
        target.yearStart,
        target.yearEnd,
        candidate.yearStart,
        candidate.yearEnd,
      ].every((value) => value !== null) &&
      candidate.yearStart! <= target.yearEnd! &&
      target.yearStart! <= candidate.yearEnd!;
    return title && creator && institution && dates;
  });
  const unique = [
    ...new Map(matches.map((match) => [match.id, match])).values(),
  ];
  return unique.length === 1
    ? { status: "matched" as const, candidate: unique[0] }
    : {
        status:
          unique.length > 1 ? ("ambiguous" as const) : ("unresolved" as const),
        candidate: null,
      };
}

/** Canonicalize bibliographic/event text, not entire mirrored web pages. */
export function deduplicateStatements<T extends { key: string }>(
  items: T[],
): T[] {
  return [
    ...new Map(items.map((item) => [normalized(item.key), item])).values(),
  ];
}
