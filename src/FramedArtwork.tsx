import { useState, type CSSProperties } from "react";
import { type Artwork, rarities } from "./data";
import { getFrame } from "./frames";

export default function FramedArtwork({
  art,
  missing = false,
  eager = false,
}: {
  art: Artwork;
  missing?: boolean;
  eager?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const candidate = getFrame(art);
  const frame = candidate?.src !== failedSource ? candidate : null;
  const opening = frame?.aperture ?? {
    left: 10,
    top: 8,
    width: 80,
    height: 84,
  };
  return (
    <span
      className={`framed-art ${frame ? "framed-art-supplied" : "framed-art-fallback"} ${missing ? "framed-art-missing" : ""}`}
      style={
        {
          "--frame-left": `${opening.left}%`,
          "--frame-top": `${opening.top}%`,
          "--frame-width": `${opening.width}%`,
          "--frame-height": `${opening.height}%`,
          "--frame-metal": rarities[art.rarity].color,
        } as CSSProperties
      }
    >
      {frame && (
        <span
          className="framed-art-matte"
          aria-hidden="true"
          style={{
            maskImage: `url("${frame.matte}")`,
            WebkitMaskImage: `url("${frame.matte}")`,
          }}
        />
      )}
      <span className="framed-art-window">
        <img
          className="framed-work"
          src={art.image}
          alt={art.title}
          loading={eager ? "eager" : "lazy"}
        />
      </span>
      {frame && (
        <img
          className="framed-art-overlay"
          src={frame.src}
          width={frame.width}
          height={frame.height}
          alt=""
          aria-hidden="true"
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailedSource(frame.src)}
        />
      )}
    </span>
  );
}
