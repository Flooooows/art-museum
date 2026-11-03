import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { frameFamilies, frameFamilyLabels } from "../frameRules";
import { preservedFrameFamilies } from "../prestigeSpecs";
import { experimentalFrameFinishes } from "../generationStyle";

const root = "src/card-lab/experiments";
const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const registry = JSON.parse(
  await readFile("src/card-lab/assets/refined-frames.json", "utf8"),
);
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

// Reuse the six approved families byte-for-byte; do not generate or recolor them.
for (const family of preservedFrameFamilies) {
  const dir = `${root}/${family}`;
  await mkdir(dir, { recursive: true });
  const outputs = [],
    tiles = [];
  for (const [
    index,
    { finish, label },
  ] of experimentalFrameFinishes.entries()) {
    const frame = registry.frames[`${family}-${finish}`];
    const referenceFile = `src/card-lab/assets/${frame.assetDirectory}/${frame.file}`;
    const bytes = await readFile(referenceFile);
    if (sha(bytes) !== frame.outputSha256)
      throw Error(`Référence altérée : ${referenceFile}`);
    const file = `${dir}/essai-01-${finish}.webp`;
    await copyFile(referenceFile, file);
    outputs.push({
      finish,
      file,
      sha256: sha(bytes),
      referenceFile,
      referenceSha256: frame.outputSha256,
    });
    tiles.push({
      input: await sharp(bytes).resize(256, 384).png().toBuffer(),
      left: index * 276 + 10,
      top: 36,
    });
    tiles.push({
      input: Buffer.from(
        `<svg width="270" height="28"><text x="10" y="20" font-family="Arial" font-size="13" fill="#f5eadb">${escape(label)}</text></svg>`,
      ),
      left: index * 276,
      top: 0,
    });
  }
  await sharp({
    create: { width: 1380, height: 432, channels: 4, background: "#34242d" },
  })
    .composite(tiles)
    .png()
    .toFile(`${dir}/essai-01-cinq-finitions.png`);
  await writeFile(
    `${dir}/essai-01-finitions.json`,
    JSON.stringify(
      {
        scope: "Copie locale pour comparaison uniquement, aucune publication.",
        method:
          "Famille historique approuvée : cinq fichiers existants copiés octet pour octet, aucune génération ni recoloration.",
        outputs,
      },
      null,
      2,
    ) + "\n",
  );
}

const entries = [],
  overview = [];
for (const [index, family] of frameFamilies.entries()) {
  const old = (preservedFrameFamilies as readonly string[]).includes(family);
  const manifest = JSON.parse(
    await readFile(`${root}/${family}/essai-01-finitions.json`, "utf8"),
  );
  if (manifest.outputs.length !== 5)
    throw Error(`Cinq finitions attendues : ${family}`);
  const files = [];
  for (const { finish, label } of experimentalFrameFinishes) {
    const output = manifest.outputs.find(
      (o: { finish: string }) => o.finish === finish,
    );
    if (!output) throw Error(`Finition manquante : ${family}/${finish}`);
    const bytes = await readFile(output.file);
    if (sha(bytes) !== output.sha256)
      throw Error(`Image altérée : ${output.file}`);
    files.push({ finish, label, file: output.file.slice(root.length + 1) });
  }
  entries.push({
    family,
    label: frameFamilyLabels[family],
    kind: old ? "existing-approved-copy" : "local-experiment",
    sheet: `${family}/essai-01-cinq-finitions.png`,
    files,
  });
  const lapis = files.find((f) => f.finish === "lapis-lazuli")!;
  const x = (index % 4) * 280,
    y = Math.floor(index / 4) * 435;
  overview.push({
    input: await sharp(`${root}/${lapis.file}`)
      .resize(260, 390)
      .png()
      .toBuffer(),
    left: x + 10,
    top: y + 30,
  });
  overview.push({
    input: Buffer.from(
      `<svg width="275" height="26"><text x="8" y="18" font-family="Arial" font-size="13" fill="#f5eadb">${escape(family)}${old ? " · existant" : ""}</text></svg>`,
    ),
    left: x,
    top: y,
  });
}
await sharp({
  create: {
    width: 1120,
    height: Math.ceil(frameFamilies.length / 4) * 435,
    channels: 4,
    background: "#34242d",
  },
})
  .composite(overview)
  .png()
  .toFile(`${root}/toutes-les-categories-lapis.png`);
await writeFile(
  `${root}/catalogue.json`,
  JSON.stringify(
    {
      scope:
        "Galerie locale des fichiers sources ; l’état d’intégration du lab est défini par son registre actif, pas par cette galerie.",
      families: entries.length,
      finishesPerFamily: 5,
      totalVariants: entries.length * 5,
      entries,
    },
    null,
    2,
  ) + "\n",
);
const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cadres — palettes locales</title><style>body{margin:0;padding:2rem;background:#251c23;color:#f5eadb;font:16px/1.5 system-ui}main{max-width:1380px;margin:auto}h1{font-family:Georgia}section{margin:3rem 0}img{display:block;width:100%;height:auto;background:#34242d}a{color:#efcb82}nav{display:flex;gap:1rem;flex-wrap:wrap}.tag{color:#bca8b1}p{max-width:75ch}</style><main><h1>19 familles × 5 raretés</h1><p>Essais locaux non intégrés et non publiés. Onze nouveaux essais complètent Japon et Photographie. Les six familles historiques sont des copies exactes de leurs fichiers approuvés, sans nouvelle génération.</p><p>Chaque planche : fer, cuivre, argent, or, lapis-lazuli. Les liens ci-dessous ouvrent les fichiers individuels à leur taille native.</p><nav>${entries.map((e) => `<a href="#${e.family}">${escape(e.family)}</a>`).join("")}</nav>${entries.map((e) => `<section id="${e.family}"><h2>${escape(e.label)}</h2><p class="tag">${e.kind === "existing-approved-copy" ? "Famille historique conservée à l’identique" : "Essai local à examiner"}</p><a href="${e.sheet}"><img src="${e.sheet}" alt="Les cinq finitions de ${escape(e.label)}" loading="lazy"></a><nav>${e.files.map((f) => `<a href="${f.file}">${escape(f.label)}</a>`).join("")}</nav></section>`).join("")}</main></html>`;
await writeFile(
  `${root}/index.html`,
  html.replace(
    "Essais locaux non intégrés et non publiés.",
    registry.edition === "experiments-v1"
      ? "Fichiers sources locaux des palettes intégrées au lab sur demande de l’utilisateur. Le jeu principal reste inchangé."
      : "Essais locaux non intégrés et non publiés.",
  ) + "\n",
);
console.log(
  `${entries.length} familles, ${entries.length * 5} variantes vérifiées ; index local prêt.`,
);
