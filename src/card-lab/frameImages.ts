import type { LabFrame } from "./frames";
const urls = import.meta.glob<string>("./assets/refined-frames/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
export function frameImage(frame: LabFrame): string {
  const url = urls[`./assets/${frame.assetDirectory}/${frame.file}`];
  if (!url) throw Error(`Image de cadre non compilée : ${frame.key}`);
  return url;
}
export function frameWindowImage(frame: LabFrame): string {
  const url = urls[`./assets/${frame.assetDirectory}/${frame.windowFile}`];
  if (!url) throw Error(`Fond de cadre non compilé : ${frame.key}`);
  return url;
}
