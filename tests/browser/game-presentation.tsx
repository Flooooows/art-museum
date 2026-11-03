import { createRoot } from "react-dom/client";
import { artworks } from "../../src/data";
import MuseumCard from "../../src/game-presentation/cards/MuseumCard";
import CompactCard from "../../src/game-presentation/cards/CompactCard";
import "../../src/styles.css";
import "../../src/appearance.css";
import "../../src/navigation.css";
import "../../src/frames.css";
import "../../src/game-presentation/cards/styles.css";
import "../../src/game-presentation/integration.css";

const width = Number(new URLSearchParams(location.search).get("width")) || 300;
const Card = new URLSearchParams(location.search).has("compact")
  ? CompactCard
  : MuseumCard;
createRoot(document.getElementById("root")!).render(
  <main
    aria-label="Vérification des cartes"
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit,${width}px)`,
      gap: 20,
    }}
  >
    {artworks.map((art) => (
      <Card key={art.id} art={art} onOpen={() => {}} onFavorite={() => {}} />
    ))}
  </main>,
);
