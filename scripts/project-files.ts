import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import layout from "../catalog/history/layout-2026-10-30.json";
import legalHistory from "../catalog/legal-eu/historical-sources.json";
import publicationHistory from "../catalog/history/game-publication-2026-10-30.json";
import presentationHistory from "../catalog/history/lab-integration-2026-11-02.json";

const relocations: Record<string, string> = layout.relocations;
const archives: Record<string, string> = {
  ...layout.sourceArchives,
  ...legalHistory.sourceArchives,
  ...publicationHistory.sourceArchives,
  ...presentationHistory.sourceArchives,
};
const hash = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

/** Manifest paths remain stable identifiers; only their physical location changes. */
export function projectPath(file: string): string {
  return Object.hasOwn(relocations, file) ? relocations[file] : file;
}

export function readProjectFile(file: string): Promise<Buffer>;
export function readProjectFile(
  file: string,
  encoding: "utf8",
): Promise<string>;
export async function readProjectFile(
  file: string,
  encoding?: "utf8",
): Promise<Buffer | string> {
  return encoding
    ? readFile(projectPath(file), encoding)
    : readFile(projectPath(file));
}

export function writeProjectFile(
  file: string,
  data: Parameters<typeof writeFile>[1],
  options?: Parameters<typeof writeFile>[2],
) {
  return writeFile(projectPath(file), data, options);
}

/** Verify historical bytes, not a replacement hash of today's maintained source. */
export async function readHistoricalFile(
  file: string,
  expected: unknown,
  root = process.cwd(),
): Promise<Buffer> {
  if (typeof expected !== "string" || !/^[a-f0-9]{64}$/.test(expected))
    throw Error(`Empreinte historique invalide : ${file}`);
  try {
    const current = await readFile(path.resolve(root, projectPath(file)));
    if (hash(current) === expected) return current;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (Object.hasOwn(archives, file)) {
    const archived = await readFile(path.resolve(root, archives[file]));
    if (hash(archived) === expected) return archived;
  }
  throw Error(`Preuve historique absente ou altérée : ${file}`);
}
