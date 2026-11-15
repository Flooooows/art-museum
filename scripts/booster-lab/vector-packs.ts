/**
 * Vector pack proposals for the Booster Lab: four graphic styles × seven groups.
 * Pure SVG generated here, rasterised with sharp to WebP 768×1152 (same size as
 * the generated illustrations). Top (14–32 %) and bottom (76–95 %) zones stay
 * calm for the shared HTML typography. Run: npx tsx scripts/booster-lab/vector-packs.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { boosterGroups } from "../../src/booster-lab/groups";

const W = 768,
  H = 1152;
const out = "src/booster-lab/assets/vector";

// ---------- colour helpers ----------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) =>
  "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => {
  const x = hex(a),
    y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const darken = (c: string, t: number) => mix(c, "#000000", t);
const lighten = (c: string, t: number) => mix(c, "#ffffff", t);

// Deterministic pseudo-random numbers so every run gives identical files.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// ---------- emblems (drawn in a 200×200 box, stroke = currentColor) ----------
const emblems: Record<string, string> = {
  universel: `<circle cx="78" cy="88" r="46"/><rect x="92" y="74" width="74" height="74"/><path d="M60 162 L100 92 L140 162 Z"/>`,
  peintures: `<path d="M100 30c48 0 78 30 78 66 0 26-22 30-38 26-14-4-24 6-18 20 6 16-6 30-28 30-48 0-74-32-74-70s32-72 80-72z"/><circle cx="62" cy="80" r="11"/><circle cx="96" cy="58" r="11"/><circle cx="136" cy="70" r="11"/><circle cx="58" cy="122" r="11"/><path d="M118 160 L178 40" stroke-width="7"/>`,
  "traits-pages": `<path d="M100 60 C76 46 46 44 24 50 V160 C46 154 76 156 100 170 C124 156 154 154 176 160 V50 C154 44 124 46 100 60 Z"/><path d="M100 60 V170"/><path d="M40 78 H84 M40 98 H84 M40 118 H84 M116 78 H160 M116 98 H160 M116 118 H160"/>`,
  sculptures: `<path d="M44 52 H156"/><path d="M50 52 c-26 0-26 30 0 30 c10 0 14-8 8-14 M150 52 c26 0 26 30 0 30 c-10 0-14-8-8-14"/><path d="M66 82 H134 V170 H66 Z"/><path d="M82 86 V166 M100 86 V166 M118 86 V166"/><path d="M52 170 H148 V182 H52 Z"/>`,
  photographies: `<circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="28"/><path d="M100 30 L124 74 M160 66 L124 98 M160 134 L112 126 M100 170 L76 126 M40 134 L76 102 M40 66 L88 74"/>`,
  "matieres-objets": `<path d="M78 28 H122 M84 28 C84 46 62 50 58 74 C52 108 62 140 86 166 H114 C138 140 148 108 142 74 C138 50 116 46 116 28"/><path d="M58 84 C38 80 34 104 54 112 M142 84 C162 80 166 104 146 112"/><path d="M64 100 C88 110 112 110 136 100"/>`,
  "textiles-interieur": `<path d="M36 36 H164 V164 H36 Z"/><path d="M36 68 H164 M36 100 H164 M36 132 H164"/><path d="M68 36 V164 M100 36 V164 M132 36 V164"/><path d="M52 52 L84 84 M116 52 L148 84 M84 116 L116 148 M52 148 L84 116 M116 148 L148 116" stroke-width="3"/>`,
};
const emblem = (id: string, cx: number, cy: number, size: number, color: string, width = 5) =>
  `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 200})" fill="none" stroke="${color}" stroke-width="${(width * 200) / size}" stroke-linecap="round" stroke-linejoin="round">${emblems[id]}</g>`;

// ---------- shared pouch silhouette ----------
const crimp = (y: number, h: number, metal: string) => {
  let ridges = "";
  for (let x = 30; x < W - 30; x += 9)
    ridges += `<rect x="${x}" y="${y}" width="4" height="${h}" fill="${darken(metal, 0.35)}" opacity="0.55"/>`;
  return `<rect x="22" y="${y}" width="${W - 44}" height="${h}" fill="url(#metal)"/>${ridges}`;
};
function pouch(body: string, metal: string, defs = "", bodyFill = "url(#body)") {
  const zig = (y: number, dir: 1 | -1) => {
    let d = `M22 ${y}`;
    for (let x = 22; x < W - 22; x += 12) d += ` L${x + 6} ${y + dir * 7} L${x + 12} ${y}`;
    return d;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="${darken(metal, 0.3)}"/><stop offset="0.35" stop-color="${lighten(metal, 0.35)}"/><stop offset="0.65" stop-color="${metal}"/><stop offset="1" stop-color="${darken(metal, 0.35)}"/></linearGradient>
  <linearGradient id="sheen" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.12" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="0.88" stop-color="#fff" stop-opacity="0.06"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></linearGradient>
  <clipPath id="bodyClip"><rect x="34" y="78" width="${W - 68}" height="${H - 156}" rx="10"/></clipPath>
  ${defs}
</defs>
<path d="${zig(16, -1)} L${W - 22} 84 L22 84 Z" fill="${metal}"/>
${crimp(16, 68, metal)}
<path d="${zig(H - 16, 1)} L${W - 22} ${H - 84} L22 ${H - 84} Z" fill="${metal}"/>
${crimp(H - 84, 68, metal)}
<rect x="34" y="78" width="${W - 68}" height="${H - 156}" rx="10" fill="${bodyFill}"/>
<g clip-path="url(#bodyClip)">${body}</g>
<rect x="34" y="78" width="${W - 68}" height="${H - 156}" rx="10" fill="url(#sheen)"/>
</svg>`;
}

type Group = (typeof boosterGroups)[number];
const gold = "#c9a14a";

// ---------- style 1: Art déco ----------
function deco(g: Group) {
  const base = g.color,
    cx = W / 2,
    cy = 600;
  let rays = "";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    rays += `<path d="M${cx} ${cy} L${cx + Math.cos(a) * 900} ${cy + Math.sin(a) * 900} L${cx + Math.cos(a + 0.05) * 900} ${cy + Math.sin(a + 0.05) * 900} Z" fill="${gold}" opacity="${i % 2 ? 0.06 : 0.12}"/>`;
  }
  const step = (inset: number, o: number) =>
    `<path d="M${54 + inset} ${110 + inset} H${W - 54 - inset} V${H - 110 - inset} H${54 + inset} Z" fill="none" stroke="${gold}" stroke-width="${o}"/>`;
  let fan = "";
  for (let r = 150; r <= 230; r += 20)
    fan += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${gold}" stroke-width="${r === 230 ? 5 : 2}" opacity="${r === 230 ? 0.95 : 0.55}"/>`;
  let notches = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    notches += `<line x1="${cx + Math.cos(a) * 236}" y1="${cy + Math.sin(a) * 236}" x2="${cx + Math.cos(a) * 256}" y2="${cy + Math.sin(a) * 256}" stroke="${gold}" stroke-width="4"/>`;
  }
  const corners = [
    [64, 120, 1, 1],
    [W - 64, 120, -1, 1],
    [64, H - 120, 1, -1],
    [W - 64, H - 120, -1, -1],
  ]
    .map(([x, y, sx, sy]) => `<path d="M${x} ${y + sy * 70} V${y} H${x + sx * 70} M${x + sx * 16} ${y + sy * 52} V${y + sy * 16} H${x + sx * 52}" fill="none" stroke="${gold}" stroke-width="4"/>`)
    .join("");
  const body = `<rect width="${W}" height="${H}" fill="${base}"/>${rays}${step(0, 3)}${step(14, 1.5)}${corners}
<circle cx="${cx}" cy="${cy}" r="140" fill="${darken(base, 0.35)}"/>${fan}${notches}
${emblem(g.id, cx, cy, 170, gold, 6)}
<path d="M${cx - 120} 360 H${cx + 120} M${cx - 120} 838 H${cx + 120}" stroke="${gold}" stroke-width="2" opacity="0.8"/>`;
  return pouch(body, "#b8913c", `<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(base, 0.08)}"/><stop offset="1" stop-color="${darken(base, 0.25)}"/></linearGradient>`);
}

// ---------- style 2: Cartel de musée ----------
function musee(g: Group) {
  const paper = "#efe6d3",
    ink = "#2b1d17",
    cx = W / 2,
    // Light group colours (Traits & pages) would vanish on ivory paper.
    accent = hex(g.color).reduce((t, v) => t + v, 0) > 480 ? darken(g.color, 0.55) : g.color;
  const r = rng(g.id.length * 97 + 7);
  let fibres = "";
  for (let i = 0; i < 260; i++)
    fibres += `<line x1="${r() * W}" y1="${r() * H}" x2="${r() * W}" y2="${r() * H}" stroke="#8a7354" stroke-width="0.6" opacity="${0.04 + r() * 0.05}"/>`;
  const body = `<rect width="${W}" height="${H}" fill="${paper}"/>${fibres}
<rect x="62" y="114" width="${W - 124}" height="${H - 228}" fill="none" stroke="${ink}" stroke-width="1.4"/>
<rect x="72" y="124" width="${W - 144}" height="${H - 248}" fill="none" stroke="${ink}" stroke-width="0.6"/>
<circle cx="${cx}" cy="560" r="150" fill="${accent}"/>
<circle cx="${cx}" cy="560" r="138" fill="none" stroke="${paper}" stroke-width="1.5" opacity="0.7"/>
${emblem(g.id, cx, 560, 160, paper, 5)}
<rect x="${cx - 170}" y="742" width="340" height="96" fill="#f7f1e4" stroke="${ink}" stroke-width="1.2"/>
<path d="M${cx - 146} 772 H${cx + 60} M${cx - 146} 794 H${cx + 120} M${cx - 146} 814 H${cx + 30}" stroke="${ink}" stroke-width="3" opacity="0.55"/>
<text x="${cx + 146}" y="822" text-anchor="end" font-family="Georgia, serif" font-size="22" fill="${ink}" opacity="0.7">N° ${String(boosterGroups.indexOf(g) + 1).padStart(2, "0")}</text>
<path d="M${cx - 40} 382 H${cx + 40}" stroke="${ink}" stroke-width="1.4"/>`;
  return pouch(body, "#b9b2a4", `<linearGradient id="body"><stop offset="0" stop-color="${paper}"/></linearGradient>`);
}

// ---------- style 3: Sceau de cire ----------
function sceau(g: Group) {
  const velvet = darken(g.color, 0.45),
    wax = g.id === "universel" ? "#9e1f2b" : mix(g.color, "#a3222f", 0.45),
    cx = W / 2,
    cy = 590;
  const r = rng(g.id.length * 31 + 3);
  let blob = "";
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2,
      rad = 168 + (r() - 0.5) * 22;
    blob += `${i ? "L" : "M"}${cx + Math.cos(a) * rad} ${cy + Math.sin(a) * rad} `;
  }
  const defs = `<pattern id="damask" width="96" height="120" patternUnits="userSpaceOnUse">
  <path d="M48 8 C64 30 76 40 88 60 C76 80 64 90 48 112 C32 90 20 80 8 60 C20 40 32 30 48 8 Z" fill="none" stroke="${lighten(velvet, 0.18)}" stroke-width="2"/>
  <path d="M48 34 C56 46 62 52 68 60 C62 68 56 74 48 86 C40 74 34 68 28 60 C34 52 40 46 48 34 Z" fill="${lighten(velvet, 0.1)}"/>
  <circle cx="0" cy="0" r="5" fill="${lighten(velvet, 0.14)}"/><circle cx="96" cy="0" r="5" fill="${lighten(velvet, 0.14)}"/><circle cx="0" cy="120" r="5" fill="${lighten(velvet, 0.14)}"/><circle cx="96" cy="120" r="5" fill="${lighten(velvet, 0.14)}"/>
</pattern>
<radialGradient id="wax" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="${lighten(wax, 0.25)}"/><stop offset="0.6" stop-color="${wax}"/><stop offset="1" stop-color="${darken(wax, 0.4)}"/></radialGradient>
<linearGradient id="body"><stop offset="0" stop-color="${velvet}"/></linearGradient>`;
  const body = `<rect width="${W}" height="${H}" fill="${velvet}"/><rect width="${W}" height="${H}" fill="url(#damask)" opacity="0.9"/>
<path d="M${cx - 60} ${cy + 120} L${cx - 90} ${cy + 250} L${cx - 62} ${cy + 228} L${cx - 38} ${cy + 262} L${cx - 10} ${cy + 140} Z" fill="${darken(g.color, 0.1)}"/>
<path d="M${cx + 60} ${cy + 120} L${cx + 90} ${cy + 250} L${cx + 62} ${cy + 228} L${cx + 38} ${cy + 262} L${cx + 10} ${cy + 140} Z" fill="${darken(g.color, 0.2)}"/>
<path d="${blob}Z" fill="#00000055" transform="translate(6 10)"/>
<path d="${blob}Z" fill="url(#wax)"/>
<circle cx="${cx}" cy="${cy}" r="122" fill="none" stroke="${darken(wax, 0.35)}" stroke-width="5"/>
<circle cx="${cx}" cy="${cy}" r="110" fill="none" stroke="${lighten(wax, 0.2)}" stroke-width="1.5" opacity="0.6"/>
${emblem(g.id, cx + 2, cy + 3, 150, darken(wax, 0.45), 7)}
${emblem(g.id, cx, cy, 150, lighten(wax, 0.3), 3)}`;
  return pouch(body, "#8d7a68", defs);
}

// ---------- style 4: Vitrail ----------
function vitrail(g: Group) {
  const lead = "#1d1416",
    cx = W / 2;
  const r = rng(g.id.length * 53 + 11);
  const tones = [g.color, lighten(g.color, 0.25), darken(g.color, 0.2), mix(g.color, "#d9a441", 0.45), mix(g.color, "#3c6aa8", 0.35), lighten(g.color, 0.45)];
  // Pointed arch window.
  // Stays between the brand (ends ~32 %) and the edition text (starts ~76 %).
  const top = 440,
    bottom = 840,
    left = 190,
    right = W - 190;
  const arch = `M${left} ${bottom} V${top + 110} Q${left} ${top} ${cx} ${top - 60} Q${right} ${top} ${right} ${top + 110} V${bottom} Z`;
  let panes = "";
  const cols = 6,
    rows = 10,
    cw = (right - left) / cols,
    rh = (bottom - top + 60) / rows;
  const jitter = () => (r() - 0.5) * 22;
  const pts: number[][][] = [];
  for (let y = 0; y <= rows; y++) {
    pts[y] = [];
    for (let x = 0; x <= cols; x++)
      pts[y][x] = [left + x * cw + (x % cols ? jitter() : 0), top - 60 + y * rh + (y % rows ? jitter() : 0)];
  }
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const [a, b, c, d] = [pts[y][x], pts[y][x + 1], pts[y + 1][x + 1], pts[y + 1][x]];
      const t1 = tones[Math.floor(r() * tones.length)],
        t2 = tones[Math.floor(r() * tones.length)];
      const diag = r() > 0.5;
      panes += diag
        ? `<path d="M${a} L${b} L${c} Z" fill="${t1}"/><path d="M${a} L${c} L${d} Z" fill="${t2}"/>`
        : `<path d="M${a} L${b} L${d} Z" fill="${t1}"/><path d="M${b} L${c} L${d} Z" fill="${t2}"/>`;
    }
  const defs = `<clipPath id="arch"><path d="${arch}"/></clipPath>
<radialGradient id="glow" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${darken(g.color, 0.55)}"/><stop offset="1" stop-color="${darken(g.color, 0.7)}"/></linearGradient>`;
  const body = `<rect width="${W}" height="${H}" fill="url(#body)"/>
<g clip-path="url(#arch)">${panes}<g stroke="${lead}" stroke-width="7" fill="none">${panes.replace(/fill="[^"]+"/g, "")}</g>
<circle cx="${cx}" cy="620" r="100" fill="${lighten(g.color, 0.75)}" stroke="${lead}" stroke-width="9"/>
${emblem(g.id, cx, 620, 130, lead, 7)}
<rect width="${W}" height="${H}" fill="url(#glow)"/></g>
<path d="${arch}" fill="none" stroke="${gold}" stroke-width="12"/>
<path d="${arch}" fill="none" stroke="${lead}" stroke-width="3"/>`;
  return pouch(body, "#7f7a74", defs);
}

export const vectorStyles = { deco, musee, sceau, vitrail } as const;

for (const [style, draw] of Object.entries(vectorStyles)) {
  await mkdir(`${out}/${style}`, { recursive: true });
  for (const group of boosterGroups) {
    const svg = draw(group);
    await writeFile(`${out}/${style}/${group.id}.svg`, svg);
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(`${out}/${style}/${group.id}.webp`);
  }
  console.log(style, boosterGroups.length, "pochettes");
}
