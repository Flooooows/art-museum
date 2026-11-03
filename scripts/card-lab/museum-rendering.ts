import {
  museumSpecs,
  type MuseumProfile,
} from "../../src/card-lab/museumSpecs";

export type MuseumFinish =
  "fer" | "cuivre" | "argent" | "dore" | "lapis-lazuli";
const accents: Record<MuseumFinish, string> = {
  fer: "#646c72",
  cuivre: "#b47f59",
  argent: "#b8c1ca",
  dore: "#bca05f",
  "lapis-lazuli": "#304f83",
};
function tint(hex: string, amount: number) {
  const rgb = hex.match(/[a-f\d]{2}/gi)!.map((v) => parseInt(v, 16));
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round(amount > 0 ? v + (255 - v) * amount : v * (1 + amount))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** A physical, mitred rail profile; no themed objects or ornamental illustrations. */
export function renderMuseumFrame(
  family: keyof typeof museumSpecs,
  finish: MuseumFinish,
) {
  const s: MuseumProfile = museumSpecs[family];
  const w = 1024,
    h = 1536,
    margin = 26;
  const defs: string[] = [],
    pieces: string[] = [];
  let serial = 0;
  function ring(
    a: number,
    b: number,
    color: string,
    bevel = false,
    texture?: string,
    continuous = false,
  ) {
    if (continuous) {
      const id = `plain${serial++}`;
      const d = `M${a} ${a}H${w - a}V${h - a}H${a}Z M${b} ${b}V${h - b}H${w - b}V${b}Z`;
      pieces.push(`<path d="${d}" fill="${color}" fill-rule="evenodd"/>`);
      if (texture === "linen" || texture === "paper")
        pieces.push(
          `<path d="${d}" fill="url(#${texture})" fill-rule="evenodd"/>`,
        );
      return;
    }
    const polygons = [
      `${a},${a} ${w - a},${a} ${w - b},${b} ${b},${b}`,
      `${w - a},${a} ${w - a},${h - a} ${w - b},${h - b} ${w - b},${b}`,
      `${w - a},${h - a} ${a},${h - a} ${b},${h - b} ${w - b},${h - b}`,
      `${a},${h - a} ${a},${a} ${b},${b} ${b},${h - b}`,
    ];
    const gradients = [
      `x1="0" y1="${a}" x2="0" y2="${b}"`,
      `x1="${w - a}" y1="0" x2="${w - b}" y2="0"`,
      `x1="0" y1="${h - a}" x2="0" y2="${h - b}"`,
      `x1="${a}" y1="0" x2="${b}" y2="0"`,
    ];
    for (let side = 0; side < 4; side++) {
      const id = `p${serial++}`,
        light = side === 0 ? 0.09 : side === 3 ? 0.04 : -0.07;
      const base = tint(color, light);
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ${gradients[side]}><stop stop-color="${tint(base, bevel ? 0.2 : 0.035)}"/><stop offset=".45" stop-color="${base}"/><stop offset="1" stop-color="${tint(base, bevel ? -0.21 : -0.04)}"/></linearGradient>`,
      );
      pieces.push(`<polygon points="${polygons[side]}" fill="url(#${id})"/>`);
      if (texture) {
        const clip = `c${serial++}`;
        defs.push(
          `<clipPath id="${clip}"><polygon points="${polygons[side]}"/></clipPath>`,
        );
        let marks = "";
        const horizontal = side === 0 || side === 2;
        if (texture === "wood") {
          for (let i = 0; i < Math.ceil((b - a) / 2); i++) {
            const q = a + 1.1 + i * 2,
              offset = ((s.seed % 7) + (i % 5)) * 0.24;
            const d = horizontal
              ? `M0 ${side === 0 ? q : h - q} C${w * 0.3} ${side === 0 ? q + offset : h - q - offset},${w * 0.6} ${side === 0 ? q - offset : h - q + offset},${w} ${side === 0 ? q : h - q}`
              : `M${side === 3 ? q : w - q} 0 C${side === 3 ? q + offset : w - q - offset} ${h * 0.3},${side === 3 ? q - offset : w - q + offset} ${h * 0.7},${side === 3 ? q : w - q} ${h}`;
            marks += `<path d="${d}" fill="none" stroke="${i % 3 ? "#21180e" : "#fff2d6"}" stroke-opacity="${i % 3 ? 0.09 : 0.09}" stroke-width="${i % 4 === 0 ? 1.1 : 0.6}"/>`;
          }
        } else if (texture === "metal") {
          for (let i = 0; i < Math.ceil((b - a) / 1.4); i++) {
            const q = a + i * 1.4;
            marks += horizontal
              ? `<path d="M0 ${side === 0 ? q : h - q}H${w}" stroke="#fff" stroke-opacity=".035" stroke-width=".4"/>`
              : `<path d="M${side === 3 ? q : w - q} 0V${h}" stroke="#fff" stroke-opacity=".035" stroke-width=".4"/>`;
          }
        } else if (texture === "linen" || texture === "paper") {
          marks = `<rect width="${w}" height="${h}" fill="url(#${texture})"/>`;
        }
        pieces.push(`<g clip-path="url(#${clip})">${marks}</g>`);
      }
    }
  }
  defs.push(
    `<pattern id="linen" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 1H5 M1 0V5" fill="none" stroke="#3c3020" stroke-opacity=".07" stroke-width=".55"/><path d="M0 3H5" stroke="#fff" stroke-opacity=".1" stroke-width=".6"/></pattern>`,
  );
  defs.push(
    `<pattern id="paper" width="13" height="11" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".4" fill="#6a6050" opacity=".07"/><circle cx="9" cy="8" r=".35" fill="#fff" opacity=".18"/></pattern>`,
  );
  let a = margin;
  ring(a, a + 2, tint(s.body, -0.38));
  a += 2;
  ring(a, a + s.bevel, s.body, true);
  a += s.bevel;
  if (family === "estampes" || family === "mobilier") {
    ring(a, a + s.face * 0.35, tint(s.body, 0.04), true, s.surface);
    ring(a + s.face * 0.35, a + s.face, s.body, false, s.surface);
  } else if (family === "ceramique") {
    ring(a, a + s.face * 0.2, tint(s.body, 0.08), true, s.surface);
    ring(a + s.face * 0.2, a + s.face * 0.8, s.body, false, s.surface);
    ring(a + s.face * 0.8, a + s.face, tint(s.body, -0.04), true, s.surface);
  } else ring(a, a + s.face, s.body, false, s.surface);
  a += s.face;
  ring(a, a + 3, tint(s.body, -0.25), true);
  a += 3;
  // Two quiet fillets occupy the same footprint in every rarity; no added badges/jewels.
  ring(a, a + 5, accents[finish], true);
  a += 5;
  ring(
    a,
    a + 1.8,
    finish === "lapis-lazuli" ? "#bba46d" : tint(accents[finish], 0.13),
  );
  a += 1.8;
  if (family === "japon") {
    ring(a, a + 2, "#674035");
    a += 2;
  }
  ring(a, a + s.depth, tint(s.liner, -0.21), false, undefined, true);
  a += s.depth;
  ring(a, a + s.slip, s.liner, false, s.linerTexture, true);
  a += s.slip;
  ring(a, a + 4, tint(s.liner, 0.11), false, undefined, true);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs.join("")}</defs>${pieces.join("")}</svg>`;
}
