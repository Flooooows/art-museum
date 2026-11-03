export function isBoosterChroma(r: number, g: number, b: number) {
  return (
    Math.min(r, b) > 150 &&
    g < 100 &&
    Math.min(r, b) - g > 100 &&
    Math.abs(r - b) < 35
  );
}
/** Remove only connected exterior empty pixels. Never cut a window into a foil pouch. */
export function cleanBoosterSource(
  input: Buffer,
  width: number,
  height: number,
) {
  if (input.length !== width * height * 4)
    throw Error("Dimensions RGBA incohérentes.");
  const output = Buffer.from(input),
    seen = new Uint8Array(width * height),
    queue = new Int32Array(width * height);
  const passable = (p: number) =>
    input[p * 4 + 3] < 16 ||
    isBoosterChroma(input[p * 4], input[p * 4 + 1], input[p * 4 + 2]);
  let head = 0,
    tail = 0;
  const seed = (p: number) => {
    if (!seen[p] && passable(p)) {
      seen[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    seed(x);
    seed((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seed(y * width);
    seed(y * width + width - 1);
  }
  if (!tail)
    throw Error("Aucun fond extérieur extractible : contrôle visuel requis.");
  while (head < tail) {
    const p = queue[head++],
      x = p % width,
      y = Math.floor(p / width);
    output.fill(0, p * 4, p * 4 + 4);
    if (x) seed(p - 1);
    if (x < width - 1) seed(p + 1);
    if (y) seed(p - width);
    if (y < height - 1) seed(p + width);
  }
  if (seen[Math.floor(height / 2) * width + Math.floor(width / 2)])
    throw Error("La pochette n’est pas opaque en son centre.");
  let left = width,
    top = height,
    right = 0,
    bottom = 0,
    opaquePixels = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (output[p + 3] >= 16) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x + 1);
        bottom = Math.max(bottom, y + 1);
        opaquePixels++;
      }
    }
  if (opaquePixels < width * height * 0.45)
    throw Error("Silhouette de pochette trop petite.");
  return {
    rgba: output,
    bounds: { left, top, width: right - left, height: bottom - top },
    exteriorPixels: tail,
  };
}
