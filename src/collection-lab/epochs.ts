import type { Artwork } from "../data";

/**
 * Epochs derived only from each artwork's own `date` text (museum notices, in
 * English or French). No editorial guess: the representative year is the first
 * dated year of the notice, with its era (BCE / av. J.-C.) applied.
 */
export const epochs = [
  { id: "antiquite", title: "Antiquité et avant", until: 500 },
  { id: "moyen-age", title: "Moyen Âge (500–1400)", until: 1400 },
  { id: "15-16", title: "XVᵉ–XVIᵉ siècles", until: 1600 },
  { id: "17", title: "XVIIᵉ siècle", until: 1700 },
  { id: "18", title: "XVIIIᵉ siècle", until: 1800 },
  { id: "19", title: "XIXᵉ siècle", until: 1900 },
  { id: "20", title: "XXᵉ siècle et après", until: Infinity },
] as const;
export type EpochId = (typeof epochs)[number]["id"];

const roman: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
function fromRoman(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i++) {
    const current = roman[value[i]],
      next = roman[value[i + 1]] ?? 0;
    total += current < next ? -current : current;
  }
  return total;
}

const bce = /\bBCE\b|av\.\s*J\.-C\./;
const ce = /\bCE\b|apr\.\s*J\.-C\./;

/** Is the text that follows a year in BCE (first era marker after it)? */
function isBce(rest: string) {
  const before = rest.search(bce),
    after = rest.search(ce);
  return before >= 0 && (after < 0 || before < after);
}

/** Representative year of a notice date, or null when it holds no date. */
export function representativeYear(date: string): number | null {
  const text = date.replace(/\s+/g, " ").trim();
  // "2e quart du XIXe siècle (1830)": the parenthesis holds the actual years.
  const quarter = text.match(/quart du [IVXLC]+e siècle \((?:vers )?(\d{3,4})/);
  if (quarter) return Number(quarter[1]);
  // Roman centuries and millennia: "XIe siècle", "IVe millénaire av. J.-C.".
  const century = text.match(/\b([IVXLC]+)(?:er|e)\s+(siècle|millénaire)/);
  if (century) {
    const n = fromRoman(century[1]);
    const negative = isBce(text);
    if (century[2] === "millénaire")
      return negative ? -(n * 1000 - 500) : n * 1000 - 500;
    const start = (n - 1) * 100;
    if (negative) return -(start + (/^Fin/.test(text) ? 20 : 50));
    return start + (/^Fin/.test(text) ? 80 : 50);
  }
  const ordinal = text.match(/\b(\d{1,2})(?:st|nd|rd|th) century/);
  if (ordinal) {
    const start = (Number(ordinal[1]) - 1) * 100 + 50;
    return isBce(text) ? -start : start;
  }
  const year = text.match(/(\d{1,4})(s?)/);
  if (!year) return null;
  let value = Number(year[1]);
  // "1780s" is a decade, "1800s" / "300s" a century.
  if (year[2] === "s") value += value % 100 === 0 ? 50 : 5;
  const rest = text.slice((year.index ?? 0) + year[0].length);
  return isBce(rest) ? -value : value;
}

const cache = new Map<string, EpochId | null>();
export function epochOf(art: Pick<Artwork, "date">): EpochId | null {
  let epoch = cache.get(art.date);
  if (epoch === undefined) {
    const year = representativeYear(art.date);
    epoch = year === null ? null : epochs.find((e) => year < e.until)!.id;
    cache.set(art.date, epoch);
  }
  return epoch;
}
