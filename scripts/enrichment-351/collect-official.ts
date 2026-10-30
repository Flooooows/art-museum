import { readFile, writeFile, mkdir } from "node:fs/promises";
import { sha256 } from "../rarity-v2/http";
const dir = "catalog/enrichment-351";
const selection = JSON.parse(
  await readFile(`${dir}/official-selection.json`, "utf8"),
);
await mkdir(`${dir}/official`, { recursive: true });
const records = [];
for (const entry of selection.records) {
  const file = `${dir}/official/${sha256(entry.url)}.json`;
  let capture;
  try {
    capture = JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  if (!capture) {
    try {
      const r = await fetch(entry.url, {
        signal: AbortSignal.timeout(45000),
        headers: { "User-Agent": "MUSE metadata research" },
      });
      const html = await r.text();
      capture = {
        url: entry.url,
        finalUrl: r.url,
        httpStatus: r.status,
        retrievedAt: new Date().toISOString(),
        html: r.status === 200 ? html : null,
        sha256: r.status === 200 ? sha256(html) : null,
      };
    } catch (e) {
      capture = {
        url: entry.url,
        httpStatus: null,
        html: null,
        error: String(e),
      };
    }
    await writeFile(file, JSON.stringify(capture, null, 2) + "\n");
  }
  const normalized = (capture.html ?? "")
    .replace(/&(?:rsquo|#39|apos);/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const tokensMatched = entry.tokens.every((t: string) =>
    normalized.includes(
      t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
    ),
  );
  records.push({
    ...entry,
    evidenceFile: file,
    httpStatus: capture.httpStatus,
    tokensMatched,
    inventoryFound: normalized.includes(entry.inventory.toLowerCase()),
  });
  console.log(entry.input, capture.httpStatus, tokensMatched, entry.inventory);
}
await writeFile(
  `${dir}/official.json`,
  JSON.stringify(
    {
      records,
      note: "Un code 200 et des mots présents ne sont qu’une aide au contrôle : la concordance d’objet et de fichier reste à approuver manuellement. Les pages de consentement et échecs ne valent pas notices.",
    },
    null,
    2,
  ) + "\n",
);
