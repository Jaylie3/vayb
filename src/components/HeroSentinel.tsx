import { useEffect, useRef } from "react";
import { useChrome } from "@/layouts/ChromeContext";

/**
 * 1px sentinel placed at the bottom of a full-bleed hero. While it remains
 * intersecting the viewport, the global header renders transparent. Once it
 * scrolls out of view, the header flips to its solid state.
 */
export const HeroSentinel = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { setTransparent } = useChrome();

  useEffect(() => {
    setTransparent(true);
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setTransparent(entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      setTransparent(false);
    };
  }, [setTransparent]);

  return <div ref={ref} aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px w-full" />;
};
