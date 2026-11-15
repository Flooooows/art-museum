/**
 * Generate booster pouch illustrations with OpenAI's image API.
 *
 *   npm run image:booster -- --booster peintures --style "Art nouveau, vitrail et laiton"
 *   npm run image:booster -- --booster all --style "Estampe japonaise" --ref public/assets/booster.png
 *   npm run image:booster -- --prompt "Texte libre" --name essai
 *   ... --dry-run   (prints the request, sends nothing)
 *
 * Needs OPENAI_API_KEY in `.env` (see .env.example). Every image is written to
 * output/imagegen/ (ignored by Git) with a JSON sidecar: prompt, model, date and
 * SHA-256, so a chosen image can later be prepared for the lab with its provenance.
 * The prompt (and any reference image) is sent to OpenAI.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { boosterGroups } from "../../src/booster-lab/groups";

try {
  process.loadEnvFile(".env");
} catch {
  // No .env: rely on the environment (or --dry-run).
}

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes("--dry-run");
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const reference = flag("ref");
const style = flag("style") ?? "pochette en aluminium brillant, illustration peinte";
const outDir = "output/imagegen";

/** Same layout constraints as the published pouches: HTML text is added later. */
export function boosterPrompt(group: (typeof boosterGroups)[number], look: string) {
  return [
    `Front view of ONE sealed trading-card booster pouch for an art museum game, portrait 2:3, centered, nothing else in the image.`,
    `Visual style: ${look}.`,
    `Theme of this pouch: ${group.title} — ${group.motif} Palette: ${group.palette} (main colour ${group.color}).`,
    `Crimped metallic seals at the top and bottom edges.`,
    `Keep the top quarter and the bottom quarter of the pouch calm and empty: a logo and a title will be added later in HTML.`,
    `No text, letters, numbers, logos or watermark anywhere. Plain flat dark background around the pouch, no shadow on the background.`,
  ].join(" ");
}

type Job = { name: string; prompt: string };
const jobs: Job[] = [];
const booster = flag("booster");
const free = flag("prompt");
if (free) jobs.push({ name: flag("name") ?? "essai", prompt: free });
else if (booster) {
  const groups =
    booster === "all" ? boosterGroups : boosterGroups.filter((g) => g.id === booster);
  if (!groups.length)
    throw Error(
      `Pochette inconnue : ${booster}. Choix : all, ${boosterGroups.map((g) => g.id).join(", ")}`,
    );
  for (const g of groups) jobs.push({ name: `booster-${g.id}`, prompt: boosterPrompt(g, style) });
} else {
  console.log(
    `Usage : npm run image:booster -- --booster <${boosterGroups.map((g) => g.id).join("|")}|all> [--style "…"] [--ref image.png] [--dry-run]\n        npm run image:booster -- --prompt "…" [--name nom] [--dry-run]`,
  );
  process.exit(1);
}

const key = process.env.OPENAI_API_KEY;
if (!dryRun && !key)
  throw Error("OPENAI_API_KEY manquante : copier .env.example en .env et y coller votre clé.");

async function generate(job: Job): Promise<Buffer> {
  const common = { model, prompt: job.prompt, size: "1024x1536", n: 1 };
  let response: Response;
  if (reference) {
    // Edits endpoint: the reference image guides the pouch shape and finish.
    const form = new FormData();
    for (const [k, v] of Object.entries(common)) form.append(k, String(v));
    form.append(
      "image[]",
      new Blob([await readFile(reference)], { type: "image/png" }),
      path.basename(reference),
    );
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(common),
    });
  }
  const body = (await response.json()) as {
    data?: { b64_json?: string }[];
    error?: { message: string };
  };
  if (!response.ok || !body.data?.[0]?.b64_json)
    throw Error(`OpenAI (${response.status}) : ${body.error?.message ?? "réponse sans image"}`);
  return Buffer.from(body.data[0].b64_json, "base64");
}

await mkdir(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
for (const job of jobs) {
  if (dryRun) {
    console.log(`[essai à blanc] ${job.name} · ${model}${reference ? ` · réf. ${reference}` : ""}\n${job.prompt}\n`);
    continue;
  }
  const bytes = await generate(job);
  const file = `${outDir}/${job.name}-${stamp}.png`;
  await writeFile(file, bytes);
  await writeFile(
    file.replace(/\.png$/, ".json"),
    JSON.stringify(
      {
        model: `openai/${model}`,
        createdAt: new Date().toISOString(),
        prompt: job.prompt,
        reference: reference ?? null,
        referenceSha256: reference
          ? createHash("sha256").update(await readFile(reference)).digest("hex")
          : null,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`✓ ${file}`);
}
