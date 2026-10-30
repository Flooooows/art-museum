export const ENRICHMENT_STORAGE_KEY = "muse:enrichment-351-review:v1";

export function candidateBatch(search: string) {
  const initial = new URLSearchParams(search).get("lot") === "initial";
  return {
    initial,
    links: [
      {
        href: "/masterpieces.html",
        label: "Enrichissement · 78 œuvres",
        current: !initial,
      },
      {
        href: "/masterpieces.html?lot=initial",
        label: "Premier lot · 25 œuvres",
        current: initial,
      },
    ],
  };
}
