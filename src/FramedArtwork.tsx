import { type Artwork } from "./data";

export default function FramedArtwork({
  art,
  missing = false,
  eager = false,
}: {
  art: Artwork;
  missing?: boolean;
  eager?: boolean;
}) {
  return (
    <span
      className={`framed-art artwork-unframed ${missing ? "framed-art-missing" : ""}`}
    >
      <span className="framed-art-window">
        <img
          className="framed-work"
          src={art.image}
          alt={art.title}
          loading={eager ? "eager" : "lazy"}
        />
      </span>
    </span>
  );
}
