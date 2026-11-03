import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "./http";

export async function assertProtectedInputs(
  root: string,
): Promise<Record<string, string>> {
  const manifest = JSON.parse(
    await readFile(
      path.join(root, "catalog/rarity-v2/protected-inputs.json"),
      "utf8",
    ),
  ) as { files: Record<string, string> };
  for (const [file, expected] of Object.entries(manifest.files)) {
    if (sha256(await readFile(path.join(root, file))) !== expected)
      throw new Error(
        `Entrée protégée modifiée : ${file}. Arrêt sans migration.`,
      );
  }
  return manifest.files;
}

export async function frozenWrite(
  file: string,
  content: string,
): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  try {
    await writeFile(file, content, { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if ((await readFile(file, "utf8")) !== content)
      throw new Error(`Sortie figée différente, non écrasée : ${file}`);
  }
}
