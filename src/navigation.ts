export type Page = "pochettes" | "marche" | "collection" | "profil";

export const navigation: { id: Page; label: string }[] = [
  { id: "pochettes", label: "Pochettes" },
  { id: "marche", label: "Marché" },
  { id: "collection", label: "Collection" },
  { id: "profil", label: "Profil" },
];

export function resolvePage(hash: string): Page {
  const value = hash.replace(/^#/, "");
  if (value === "musee") return "collection";
  return navigation.some((item) => item.id === value)
    ? (value as Page)
    : "pochettes";
}
