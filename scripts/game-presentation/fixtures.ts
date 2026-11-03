import { mkdir, writeFile } from "node:fs/promises";
import { artworks } from "../../src/data";
import { cardFrameFor } from "../../src/game-presentation/cards/frames";
import {
  boosterGroups,
  worksForBooster,
} from "../../src/game-presentation/boosters/groups";
import { ratesForPack } from "../../src/packSelection";

const dir = process.env.MUSE_TEST_DIR || "/tmp/opencode/muse-main-integration";
const sampleIds = [
  "cma-136510",
  "mona-lisa",
  "45434",
  "cma-137128",
  "467642",
  "cma-164940",
  "cma-153706",
  "cma-132644",
  "cma-324441",
  "cma-130939",
  "cma-149850",
  "cma-307213",
  "cma-143278",
  "544864",
  "820892",
  "35",
  "cma-112958",
  "cma-161426",
  "cma-151884",
  "cma-102388",
  "cma-93984",
];
if (sampleIds.some((id) => !artworks.some((a) => a.id === id)))
  throw Error("Œuvre de vérification absente.");
await mkdir(dir, { recursive: true });
await writeFile(
  `${dir}/expected.json`,
  JSON.stringify(
    {
      sampleIds,
      artworks: Object.fromEntries(
        artworks.map((a) => [
          a.id,
          {
            title: a.title,
            artist: a.artist,
            rarity: a.rarity,
            frame: cardFrameFor(a).key,
          },
        ]),
      ),
      groups: boosterGroups.map((g) => ({
        id: g.id,
        title: g.title,
        ids: worksForBooster(g.id).map((a) => a.id),
        rates: ratesForPack(g.id),
      })),
    },
    null,
    2,
  ) + "\n",
);
