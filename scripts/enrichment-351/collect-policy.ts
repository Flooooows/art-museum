import { mkdir, readFile, writeFile } from "node:fs/promises";
import { sha256 } from "../rarity-v2/http";
const dir = "catalog/enrichment-351/policies";
await mkdir(dir, { recursive: true });
const urls = [
  "https://metmuseum.github.io/",
  "https://raw.githubusercontent.com/metmuseum/openaccess/master/README.md",
  "https://economie.fgov.be/fr/themes/propriete-intellectuelle/droits-de-propriete/droits-dauteur-et-droits/droits-dauteur/protection-des-oeuvres/duree-du-droit-dauteur",
  "https://www.economie.gouv.fr/apie/les-contenus-concernes-par-le-droit-dauteur",
  "https://economie.fgov.be/fr/themes/propriete-intellectuelle/droits-de-propriete/droits-dauteur-et-droits/les-droits-dauteur",
  "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006278937",
  "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32006L0116",
  "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32019L0790",
  "https://guides.library.cornell.edu/copyright/publicdomain",
  "https://www.uffizi.it/en/professional-services/photo-rights-reproductions",
  "https://creativecommons.org/publicdomain/zero/1.0/",
  "https://creativecommons.org/licenses/by/4.0/",
  "https://creativecommons.org/licenses/by-sa/4.0/",
  "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
  "https://www.artic.edu/open-access/open-access-images",
];
const records = [];
for (const url of urls) {
  const file = `${dir}/${sha256(url)}.json`;
  let record;
  try {
    record = JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  if (!record) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(45000) });
      const text = await r.text();
      record = {
        url,
        finalUrl: r.url,
        retrievedAt: new Date().toISOString(),
        httpStatus: r.status,
        text: r.ok ? text : null,
        textSha256: r.ok ? sha256(text) : null,
      };
    } catch (e) {
      record = { url, httpStatus: null, error: String(e), text: null };
    }
    await writeFile(file, JSON.stringify(record, null, 2) + "\n");
  }
  records.push({ url, file, httpStatus: record.httpStatus });
  console.log(record.httpStatus, url);
}
await writeFile(
  "catalog/enrichment-351/policies.json",
  JSON.stringify(
    {
      records,
      note: "Les erreurs ne sont pas des preuves de permission. Les textes sont des références générales ; chaque fiche requiert une analyse propre.",
    },
    null,
    2,
  ) + "\n",
);
