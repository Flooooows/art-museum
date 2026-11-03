import { applyMaterial } from "./generated-processing";

/** Sculpture source alone has a translucent studio veil, unlike actual stone (>230 alpha). */
export function clearSculptureBackdrop(input: Buffer) {
  const output = Buffer.from(input);
  for (let p = 0; p < input.length; p += 4)
    if (input[p + 3] < 230) output.fill(0, p, p + 4);
  return output;
}

/** Preserve paper/leather/stone/fabric/wood instead of repainting the whole frame. */
export function applyThemedMaterial(
  input: Buffer,
  finish: "fer" | "cuivre" | "argent" | "dore" | "lapis-lazuli",
  family: string,
) {
  if (finish === "lapis-lazuli") return Buffer.from(input);
  const tone = applyMaterial(input, finish),
    output = Buffer.from(input);
  for (let p = 0; p < input.length; p += 4)
    if (input[p + 3]) {
      const r = input[p],
        g = input[p + 1],
        b = input[p + 2];
      const blueAccent = b > 55 && b > r * 1.25 && b > g * 1.12;
      const goldAccent =
        family !== "mobilier" &&
        family !== "archeologie" &&
        r > 140 &&
        g > 85 &&
        r > g * 1.1 &&
        g > b * 1.3 &&
        b < r * 0.65;
      const weight = blueAccent || goldAccent ? 1 : 0.12;
      for (let c = 0; c < 3; c++)
        output[p + c] = Math.round(
          input[p + c] * (1 - weight) + tone[p + c] * weight,
        );
    }
  return output;
}
