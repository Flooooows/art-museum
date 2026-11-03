import sharp from "sharp";
import { applyMaterial } from "./generated-processing";
import { refineFrame } from "./refined-processing";

type Finish = "fer" | "cuivre" | "argent" | "dore" | "lapis-lazuli";
const fields: Record<
  Exclude<Finish, "lapis-lazuli">,
  [number, number, number][]
> = {
  fer: [
    [18, 25, 34],
    [52, 65, 78],
    [109, 124, 139],
  ],
  cuivre: [
    [34, 16, 16],
    [104, 35, 33],
    [191, 107, 82],
  ],
  argent: [
    [28, 38, 51],
    [135, 154, 166],
    [228, 238, 242],
  ],
  dore: [
    [33, 26, 16],
    [141, 120, 79],
    [212, 194, 147],
  ],
};
/** Distinct colored fields and metal ridges, inspired by the approved finishes. */
export function applyDecorativeFinish(input: Buffer, finish: Finish) {
  if (finish === "lapis-lazuli") return Buffer.from(input);
  const out = applyMaterial(input, finish),
    stops = fields[finish];
  for (let p = 0; p < input.length; p += 4)
    if (input[p + 3]) {
      const r = input[p],
        g = input[p + 1],
        b = input[p + 2];
      if (b > 25 && b > r * 1.12 && b > g * 1.06) {
        const t = (Math.max(r, g, b) / 255) * 2,
          index = t < 1 ? 0 : 1,
          mix = Math.min(1, t - index);
        for (let c = 0; c < 3; c++)
          out[p + c] = Math.round(
            stops[index][c] * (1 - mix) + stops[index + 1][c] * mix,
          );
      }
    }
  return out;
}

/** Preserve motifs with uniformly scaled corners if the clear window needs space. */
export async function fitDecorativeWindow(input: Buffer) {
  const width = 1024,
    height = 1536;
  let original = input,
    decoded = await sharp(original)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
  if (decoded.info.width !== width || decoded.info.height !== height)
    throw Error("Dimensions inattendues.");
  let prepared = refineFrame(decoded.data, width, height, true);
  const r = prepared.rectangle,
    scale = Math.min(
      1,
      180 / r.left,
      180 / (width - r.right),
      225 / r.top,
      225 / (height - r.bottom),
    );
  let layout: unknown = null;
  if (scale < 0.999) {
    const xs = [0, r.left, r.right, width],
      ys = [0, r.top, r.bottom, height];
    const tx = [
      0,
      Math.round(r.left * scale),
      width - Math.round((width - r.right) * scale),
      width,
    ];
    const ty = [
      0,
      Math.round(r.top * scale),
      height - Math.round((height - r.bottom) * scale),
      height,
    ];
    const panels = [];
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++)
        panels.push({
          input: await sharp(original)
            .extract({
              left: xs[x],
              top: ys[y],
              width: xs[x + 1] - xs[x],
              height: ys[y + 1] - ys[y],
            })
            .resize(tx[x + 1] - tx[x], ty[y + 1] - ty[y], { fit: "fill" })
            .png()
            .toBuffer(),
          left: tx[x],
          top: ty[y],
        });
    original = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(panels)
      .png()
      .toBuffer();
    decoded = await sharp(original)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    prepared = refineFrame(decoded.data, width, height, true);
    layout = {
      scale,
      sourceCuts: { x: xs, y: ys },
      targetCuts: { x: tx, y: ty },
    };
  }
  return { original, prepared, layout };
}
