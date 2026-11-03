import sharp from "sharp";
import { refineFrame } from "./refined-processing";

/** Derived layout only: uniform corners, nine-slice rails, no chroma key.
 * Raw independently generated experiments remain intact.
 */
export async function fitProgressionWindow(input: Buffer) {
  const width = 1024,
    height = 1536;
  let original = input;
  let prepared = refineFrame(
    await sharp(original).ensureAlpha().raw().toBuffer(),
    width,
    height,
    false,
  );
  const r = prepared.rectangle;
  const scale = Math.min(
    1,
    180 / r.left,
    180 / (width - r.right),
    250 / r.top,
    250 / (height - r.bottom),
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
    const tiles = [];
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++)
        tiles.push({
          input: await sharp(input)
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
      .composite(tiles)
      .png()
      .toBuffer();
    prepared = refineFrame(
      await sharp(original).ensureAlpha().raw().toBuffer(),
      width,
      height,
      false,
    );
    layout = {
      scale,
      sourceCuts: { x: xs, y: ys },
      targetCuts: { x: tx, y: ty },
    };
  }
  return { original, prepared, layout };
}
