import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { friezePalette } from "../../src/card-lab/friezeSpecs";

const dir = "catalog/card-lab/frieze-frames/references";
await mkdir(dir, { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#e9e3d8"/>${friezePalette.map((pair, y) => pair.map((color, x) => `<rect x="${20 + x * 310}" y="${15 + y * 118}" width="290" height="100" rx="2" fill="${color}"/>`).join("")).join("")}</svg>`;
await writeFile(`${dir}/material-palette.svg`, svg);
await sharp(Buffer.from(svg)).png().toFile(`${dir}/material-palette.png`);
console.log(`${dir}/material-palette.png`);
