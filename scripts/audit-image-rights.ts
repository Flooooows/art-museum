import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import sharp from "sharp";
import { catalogDataset } from "../src/catalog/repository";
import reviews from "../catalog/image-rights-review.json";

const hash = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
assert.equal(reviews.images.length, catalogDataset.images.length);
assert.equal(
  new Set(reviews.images.map((review) => review.workId)).size,
  reviews.images.length,
);
const counts: Record<string, number> = {};
for (const image of catalogDataset.images) {
  const verification = image.rights.verification;
  assert.ok(verification, `Preuve absente : ${image.workId}`);
  assert.equal(image.rights.reviewStatus, "verified");
  const review = reviews.images.find((item) => item.workId === image.workId)!;
  assert.ok(review, `Revue absente : ${image.workId}`);
  const { workId: _id, local, license, ...evidence } = review;
  assert.deepEqual(verification, evidence);
  assert.equal(local, image.url);
  assert.equal(license, image.rights.license);
  assert.equal(image.rights.reviewedAt, verification.retrievedAt.slice(0, 10));
  const bytes = await fs.readFile(`public${image.url}`);
  assert.equal(
    hash(bytes),
    verification.sha256,
    `Image locale modifiée : ${image.workId}`,
  );
  const decoded = await sharp(bytes)
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.ok(decoded.info.width > 0 && decoded.info.height > 0);
  if (verification.decodedPixelsSha256)
    assert.equal(hash(decoded.data), verification.decodedPixelsSha256);
  else assert.equal(verification.sha256, verification.sourceSha256);
  const envelope = JSON.parse(
    await fs.readFile(verification.evidenceFile, "utf8"),
  );
  assert.equal(envelope.sourceUrl, verification.recordUrl);
  assert.equal(envelope.retrievedAt, verification.retrievedAt);
  const work = catalogDataset.works.find((item) => item.id === image.workId)!;
  if (verification.provider === "cma") {
    const record = envelope.response.data;
    assert.equal(work.museumId, "cma");
    assert.ok(
      work.sources.some(
        (source) =>
          source.provider === "cma" &&
          source.recordId === String(record.id) &&
          source.url === record.url,
      ),
    );
    assert.equal(record.share_license_status, "CC0");
    assert.equal(record.images.web.url, verification.sourceImageUrl);
    assert.equal(image.rights.license, "CC0");
  } else if (verification.provider === "met") {
    const record = envelope.response;
    assert.equal(work.museumId, "met");
    assert.equal(String(record.objectID), work.id);
    assert.equal(record.isPublicDomain, true);
    assert.equal(record.rightsAndReproduction, "");
    assert.equal(record.primaryImageSmall, verification.sourceImageUrl);
    assert.equal(image.rights.license, "public-domain");
  } else {
    assert.equal(work.id, "mona-lisa");
    const page = Object.values(envelope.response.query.pages)[0] as {
      imageinfo: { extmetadata: Record<string, { value: string }> }[];
    };
    assert.equal(page.imageinfo[0].extmetadata.License.value, "pd");
    assert.equal(page.imageinfo[0].extmetadata.Copyrighted.value, "False");
    assert.equal(image.rights.license, "public-domain");
  }
  counts[verification.provider] = (counts[verification.provider] ?? 0) + 1;
}
console.log(
  `Droits vérifiés : ${catalogDataset.images.length} images locales décodées, empreintes et preuves cohérentes (${Object.entries(
    counts,
  )
    .map(([provider, count]) => `${provider} ${count}`)
    .join(", ")}).`,
);
