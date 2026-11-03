type Finish = "fer" | "cuivre" | "argent" | "dore" | "lapis-lazuli";
export function isChroma(r: number, g: number, b: number) {
  return r > 145 && b > 145 && g < 135 && Math.min(r, b) - g > 70;
}
/** Key only the generated blank areas; no museum artwork ever enters this pipeline. */
export function cleanGeneratedMaster(
  input: Buffer,
  width: number,
  height: number,
) {
  const pixels = width * height,
    inside = new Uint8Array(pixels),
    queue = new Int32Array(pixels),
    rgba = Buffer.from(input);
  const passable = (p: number) =>
    input[p * 4 + 3] < 250 ||
    isChroma(input[p * 4], input[p * 4 + 1], input[p * 4 + 2]);
  const seed = Math.floor(height / 2) * width + Math.floor(width / 2);
  if (!passable(seed))
    throw Error(
      "Le centre du cadre généré n’est pas vide : contrôle visuel requis.",
    );
  let head = 0,
    tail = 1;
  queue[0] = seed;
  inside[seed] = 1;
  while (head < tail) {
    const p = queue[head++],
      x = p % width,
      y = Math.floor(p / width);
    if (!x || !y || x === width - 1 || y === height - 1)
      throw Error(
        "Ouverture générée non fermée : le fond rejoint l’extérieur.",
      );
    for (const n of [p - 1, p + 1, p - width, p + width])
      if (!inside[n] && passable(n)) {
        inside[n] = 1;
        queue[tail++] = n;
      }
  }
  const window = Buffer.alloc(pixels * 4);
  for (let p = 0; p < pixels; p++) {
    if (inside[p]) window.fill(255, p * 4, p * 4 + 4);
    if (
      inside[p] ||
      input[p * 4 + 3] < 20 ||
      isChroma(input[p * 4], input[p * 4 + 1], input[p * 4 + 2])
    )
      rgba.fill(0, p * 4, p * 4 + 4);
  }
  const opening = findSafeRectangle(inside, width, height);
  return { rgba, window, opening, insidePixels: tail };
}
function findSafeRectangle(mask: Uint8Array, width: number, height: number) {
  const heights = new Uint32Array(width),
    cx = Math.floor(width / 2),
    cy = Math.floor(height / 2);
  let best = { left: 0, top: 0, right: 0, bottom: 0, area: 0 };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++)
      heights[x] = mask[y * width + x] ? heights[x] + 1 : 0;
    const stack: number[] = [];
    for (let x = 0; x <= width; x++) {
      const current = x === width ? 0 : heights[x];
      while (stack.length && heights[stack[stack.length - 1]] > current) {
        const h = heights[stack.pop()!],
          left = stack.length ? stack[stack.length - 1] + 1 : 0,
          top = y - h + 1,
          area = (x - left) * h;
        if (left <= cx && x > cx && top <= cy && y >= cy && area > best.area)
          best = { left, top, right: x, bottom: y + 1, area };
      }
      if (x < width) stack.push(x);
    }
  }
  const inset = 12;
  const r = {
    left: best.left + inset,
    top: best.top + inset,
    right: best.right - inset,
    bottom: best.bottom - inset,
  };
  if (r.right - r.left < width * 0.58 || r.bottom - r.top < height * 0.58)
    throw Error(
      "Ouverture générée trop petite pour la carte et ses informations.",
    );
  return r;
}
const palettes: Record<Finish, [number, number, number, number][]> = {
  fer: [
    [0, 14, 17, 20],
    [0.5, 86, 93, 99],
    [1, 220, 226, 232],
  ],
  cuivre: [
    [0, 31, 16, 11],
    [0.5, 162, 88, 49],
    [1, 255, 229, 194],
  ],
  argent: [
    [0, 22, 28, 34],
    [0.5, 150, 161, 173],
    [1, 252, 253, 255],
  ],
  dore: [
    [0, 35, 21, 5],
    [0.5, 181, 128, 32],
    [1, 255, 244, 197],
  ],
  "lapis-lazuli": [
    [0, 7, 16, 43],
    [0.5, 22, 53, 127],
    [0.84, 63, 116, 205],
    [1, 244, 223, 170],
  ],
};
/** Five declared finish recipes from each generated silver master, not five claimed AI generations. */
export function applyMaterial(input: Buffer, finish: Finish) {
  const output = Buffer.from(input),
    stops = palettes[finish];
  for (let p = 0; p < input.length; p += 4)
    if (input[p + 3]) {
      const t =
        (0.2126 * input[p] + 0.7152 * input[p + 1] + 0.0722 * input[p + 2]) /
        255;
      const upper = stops.findIndex((s) => s[0] >= t),
        b = stops[upper < 0 ? stops.length - 1 : upper],
        a = stops[Math.max(0, (upper < 0 ? stops.length - 1 : upper) - 1)],
        mix = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
      for (let c = 0; c < 3; c++)
        output[p + c] = Math.round(a[c + 1] + (b[c + 1] - a[c + 1]) * mix);
    }
  return output;
}
export const materialRecipe =
  "Neutre argent généré puis extraction du fond, relief conservé et cinq palettes de finition déclarées : fer, cuivre, argent, or, lapis-lazuli. Aucune image d’œuvre modifiée.";
