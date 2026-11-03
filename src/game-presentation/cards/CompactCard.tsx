import { useLayoutEffect, useRef, type ComponentProps } from "react";
import MuseumCard from "./MuseumCard";

/** Keep the full card layout when reducing its display size, including long credits. */
export default function CompactCard(props: ComponentProps<typeof MuseumCard>) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const resize = () => {
      const width = element.clientWidth;
      if (!width) return;
      element.style.setProperty("--compact-scale", String(width / 320));
      element.style.setProperty("--compact-inverse-scale", String(320 / width));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="compact-card" ref={root}>
      <div className="compact-card__surface">
        <MuseumCard {...props} />
      </div>
    </div>
  );
}
