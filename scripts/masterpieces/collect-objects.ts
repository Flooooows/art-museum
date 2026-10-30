import { writeFile } from "node:fs/promises";
import { DiskCaptureStore, JsonCaptureClient, sha256 } from "../rarity-v2/http";
const dir = "catalog/masterpieces";
const client = new JsonCaptureClient({
  store: new DiskCaptureStore(`${dir}/cache`),
  offline: !process.argv.includes("--live"),
  minimumIntervalMs: 400,
  timeoutMs: 45000,
  maximumRetryAfterMs: 120000,
  userAgent: "MUSE exact-object research (metadata only)",
});
// Manually matched titles, never arbitrary top search results.
const artic = [
  27992, 28560, 20684, 111442, 14655, 94841, 61128, 6565, 16571, 64818, 16568,
  80607, 21023, 102611, 87479, 15468, 160031, 25865, 14586, 79307, 28067,
  111628, 75644, 24548, 58541, 47163, 35376, 127643, 7634, 191213, 30731, 5567,
  187528, 8027, 120215, 64339, 136740, 617, 8746, 110246, 75645, 18757, 109439,
  59426, 100858, 61428, 24306, 110663, 97686, 56682, 57048,
];
const met = [
  320053, 313680, 313666, 314826, 313662, 319853, 311158, 311152, 311164,
  319849, 315437,
];
const records = [];
for (const [provider, ids] of [
  ["artic", artic],
  ["met", met],
] as const)
  for (const id of ids) {
    const url =
      provider === "artic"
        ? `https://api.artic.edu/api/v1/artworks/${id}`
        : `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
    const r = await client.request(provider, url);
    if (r.status !== "available") throw Error(`${provider}-${id}: ${r.status}`);
    const data =
      provider === "artic"
        ? (r.payload as { data: Record<string, unknown> }).data
        : (r.payload as Record<string, unknown>);
    if ((provider === "artic" ? data.id : data.objectID) !== id)
      throw Error("Identifiant inattendu");
    records.push({
      provider,
      id,
      evidenceFile: `${dir}/cache/${sha256(r.url)}.json`,
    });
    console.log(
      provider,
      id,
      data.title,
      provider === "artic" ? data.is_public_domain : data.isPublicDomain,
      provider === "met" ? data.culture : "",
    );
  }
await writeFile(
  `${dir}/objects.json`,
  JSON.stringify({ records }, null, 2) + "\n",
);
