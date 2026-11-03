import { isChroma } from "./generated-processing";

/** Strict separation: an opaque piece of metal is never classified as empty space. */
export function refineFrame(
  input: Buffer,
  width: number,
  height: number,
  allowChroma: boolean,
) {
  const count = width * height,
    inside = new Uint8Array(count),
    queue = new Int32Array(count),
    rgba = Buffer.from(input);
  const isEmpty = (p: number) =>
    input[p * 4 + 3] < 16 ||
    (allowChroma && isChroma(input[p * 4], input[p * 4 + 1], input[p * 4 + 2]));
  const seed = Math.floor(height / 2) * width + Math.floor(width / 2);
  if (!isEmpty(seed))
    throw Error("Le centre de la source n’est pas transparent.");
  let head = 0,
    tail = 1;
  inside[seed] = 1;
  queue[0] = seed;
  while (head < tail) {
    const p = queue[head++],
      x = p % width,
      y = Math.floor(p / width);
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
      throw Error("La fenêtre intérieure rejoint l’extérieur.");
    for (const next of [p - 1, p + 1, p - width, p + width])
      if (!inside[next] && isEmpty(next)) {
        inside[next] = 1;
        queue[tail++] = next;
      }
  }
  const mask = Buffer.alloc(count * 4),
    safe = new Uint8Array(count);
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      // A one-source-pixel inward safety edge avoids interpolation onto the bevel.
      if (
        inside[p] &&
        inside[p - 1] &&
        inside[p + 1] &&
        inside[p - width] &&
        inside[p + width]
      ) {
        safe[p] = 1;
        mask.fill(255, p * 4, p * 4 + 4);
      }
    }
  for (let p = 0; p < count; p++)
    if (isEmpty(p)) rgba.fill(0, p * 4, p * 4 + 4);
  const rectangle = largestSafeRectangle(safe, width, height);
  let removedMetalPixels = 0,
    backdropOnMetalPixels = 0;
  for (let p = 0; p < count; p++)
    if (
      input[p * 4 + 3] >= 200 &&
      !(
        allowChroma &&
        isChroma(input[p * 4], input[p * 4 + 1], input[p * 4 + 2])
      )
    ) {
      if (rgba[p * 4 + 3] !== input[p * 4 + 3]) removedMetalPixels++;
      if (mask[p * 4 + 3]) backdropOnMetalPixels++;
    }
  if (removedMetalPixels || backdropOnMetalPixels)
    throw Error("Masque superposé à un ornement opaque.");
  return {
    rgba,
    mask,
    rectangle,
    removedMetalPixels,
    backdropOnMetalPixels,
    interiorPixels: tail,
  };
}

function largestSafeRectangle(mask: Uint8Array, width: number, height: number) {
  const heights = new Uint32Array(width),
    cx = Math.floor(width / 2),
    cy = Math.floor(height / 2);
  let best = { left: 0, top: 0, right: 0, bottom: 0, area: 0 };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++)
      heights[x] = mask[y * width + x] ? heights[x] + 1 : 0;
    const stack: number[] = [];
    for (let x = 0; x <= width; x++) {
      const h = x === width ? 0 : heights[x];
      while (stack.length && heights[stack[stack.length - 1]] > h) {
        const size = heights[stack.pop()!],
          left = stack.length ? stack[stack.length - 1] + 1 : 0,
          top = y - size + 1,
          area = (x - left) * size;
        if (left <= cx && x > cx && top <= cy && y >= cy && area > best.area)
          best = { left, top, right: x, bottom: y + 1, area };
      }
      if (x < width) stack.push(x);
    }
  }
  const inset = 4,
    r = {
      left: best.left + inset,
      top: best.top + inset,
      right: best.right - inset,
      bottom: best.bottom - inset,
    };
  if (r.right - r.left < width * 0.57 || r.bottom - r.top < height * 0.57)
    throw Error("Zone sûre insuffisante pour les informations.");
  return r;
}
