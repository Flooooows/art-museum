import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import { frameFamilies, frameFamilyLabels } from "../frameRules";
import { experimentalFrameFinishes } from "../generationStyle";
import { progressionJobs } from "./progression-series";
import { preservedFrameFamilies } from "../prestigeSpecs";

const root = "src/card-lab/experiments",
  catalog = "catalog/card-lab/progression-frames";
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const exists = async (file: string) => {
  try {
    await readFile(file);
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    return false;
  }
};
const selected = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...frameFamilies];
await mkdir(`${catalog}/references`, { recursive: true });
// The supplied temporary references are archived below; on another computer
// the committed copies are reused without needing the original temp folder.
const inputMap = Object.fromEntries(
  frameFamilies.map((family) => [
    family,
    {
      reference: `/tmp/opencode/p2/${family}.png`,
      source: (preservedFrameFamilies as readonly string[]).includes(family)
        ? `src/card-lab/assets/refined-frames/${family}-lapis-lazuli.webp`
        : `src/card-lab/experiments/${family}/essai-01.png`,
    },
  ]),
);
const archiveInput = async (file: string) => {
  const target = `${catalog}/references/${file.split("/").pop()!}`;
  if (!(await exists(target))) await copyFile(file, target);
  return {
    file: target,
    suppliedFile: file,
    sha256: sha(await readFile(target)),
  };
};
const commonReferences = await Promise.all(
  ["/tmp/opencode/p2/j.png", "/tmp/opencode/p2/v.png"].map(archiveInput),
);
for (const family of selected) {
  if (!(frameFamilies as readonly string[]).includes(family))
    throw Error(`Famille inconnue : ${family}`);
  const jobs = progressionJobs[family];
  if (!jobs || jobs.length !== 5) throw Error(`Jobs incomplets : ${family}`);
  const dir = `${root}/${family}`,
    outputs = [],
    tiles = [],
    details = [];
  const originalReference = await archiveInput(inputMap[family].reference);
  for (const [
    index,
    { finish, label },
  ] of experimentalFrameFinishes.entries()) {
    const file = `${dir}/essai-02-${finish}.png`,
      bytes = await readFile(file);
    const { data: alpha, info } = await sharp(bytes)
      .ensureAlpha()
      .extractChannel("alpha")
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (info.width !== 1024 || info.height !== 1536)
      throw Error(`Dimensions inattendues : ${file}`);
    if (alpha[768 * 1024 + 512] >= 16)
      throw Error(`Centre non transparent : ${file}`);
    const materialReferences = await Promise.all(
      [
        `/tmp/opencode/p2/e-${finish}.webp`,
        `/tmp/opencode/p2/p-${finish}.webp`,
      ].map(archiveInput),
    );
    outputs.push({
      finish,
      label,
      file,
      sha256: sha(bytes),
      alphaSha256: sha(alpha),
      imageJob: jobs[index],
      model: "openai/gpt-image-2",
      generationReferences:
        family === "japon" || family === "verre"
          ? null
          : [originalReference, ...commonReferences, ...materialReferences],
      originalReference: inputMap[family].source,
    });
    const title = Buffer.from(
      `<svg width="300" height="30"><text x="10" y="21" font-family="Arial" font-size="14" fill="#f5eadb">${label}</text></svg>`,
    );
    tiles.push({
      input: await sharp(bytes).resize(280, 420).png().toBuffer(),
      left: index * 300 + 10,
      top: 36,
    });
    tiles.push({ input: title, left: index * 300, top: 0 });
    details.push({
      input: await sharp(bytes)
        .extract({ left: 0, top: 0, width: 1024, height: 420 })
        .resize(300, 123)
        .png()
        .toBuffer(),
      left: index * 300,
      top: 36,
    });
    for (const [x, left] of [
      [0, 15],
      [784, 165],
    ])
      details.push({
        input: await sharp(bytes)
          .extract({ left: x, top: 450, width: 240, height: 720 })
          .resize(120, 360)
          .png()
          .toBuffer(),
        left: index * 300 + left,
        top: 185,
      });
    details.push({ input: title, left: index * 300, top: 0 });
  }
  if (new Set(outputs.map((o) => o.alphaSha256)).size === 1)
    throw Error(`Pas de progression géométrique : ${family}`);
  for (const [name, height, panels] of [
    ["cinq-raretes", 474, tiles],
    ["details", 565, details],
  ] as const) {
    const file = `${dir}/essai-02-${name}.png`;
    if (!(await exists(file)))
      await sharp({
        create: { width: 1500, height, channels: 4, background: "#34242d" },
      })
        .composite([...panels])
        .png()
        .toFile(file);
  }
  // Keep the two original test manifests intact, with their actual earlier inputs.
  const manifest = `${dir}/essai-02-progression.json`;
  if (!(await exists(manifest)))
    await writeFile(
      manifest,
      JSON.stringify(
        {
          scope:
            "Série demandée par l’utilisateur pour intégration au lab uniquement ; premiers essais et originaux conservés.",
          method:
            "Cinq générations indépendantes : matières, gravures, reliefs et ornements progressent par rareté ; aucune recoloration commune.",
          outputs,
        },
        null,
        2,
      ) + "\n",
    );
  await writeFile(
    `${catalog}/${family}.json`,
    JSON.stringify(
      {
        family,
        outputs,
        originalTestManifest:
          family === "japon" || family === "verre" ? manifest : null,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Progression et planches vérifiées : ${family}`);
}
if (selected.length === frameFamilies.length) {
  const entries = frameFamilies.map((family) => ({
    family,
    label: frameFamilyLabels[family],
    sheet: `${family}/essai-02-cinq-raretes.png`,
    details: `${family}/essai-02-details.png`,
    variants: experimentalFrameFinishes.map(({ finish, label }) => ({
      finish,
      label,
      file: `${family}/essai-02-${finish}.png`,
    })),
  }));
  const escape = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Essai 02 — progression des raretés</title><style>body{background:#251c23;color:#f5eadb;font:16px/1.5 system-ui;padding:2rem}main{max-width:1500px;margin:auto}img{width:100%;height:auto}section{margin:3rem 0}a{color:#efcb82}nav{display:flex;gap:1rem;flex-wrap:wrap}</style><main><h1>Essai 02 : 19 thèmes × 5 raretés</h1><p>Chaque rareté a son propre dessin, ses gravures et ses reliefs, pas seulement une couleur. Tous les premiers essais et les originaux historiques sont conservés. <a href="index.html">Galerie de l’essai 01</a></p>${entries.map((e) => `<section><h2>${escape(e.label)}</h2><a href="${e.sheet}"><img src="${e.sheet}" loading="lazy" alt="${escape(e.label)} : les cinq raretés"></a><nav>${e.variants.map((v) => `<a href="${v.file}">${v.label}</a>`).join("")}<a href="${e.details}">Détails</a></nav></section>`).join("")}</main></html>`;
  await writeFile(`${root}/index-essai-02.html`, html + "\n");
  await writeFile(
    `${root}/catalogue-essai-02.json`,
    JSON.stringify({ families: 19, totalVariants: 95, entries }, null, 2) +
      "\n",
  );
}
