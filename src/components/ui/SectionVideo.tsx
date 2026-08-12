"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative background video that only loads/plays while (near) the viewport.
 * Pausing off-screen videos keeps the page buttery smooth instead of decoding
 * every background clip at once.
 */
export function SectionVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        },
        { rootMargin: "300px 0px" }
      );
      io.observe(el);
    } else {
      el.play().catch(() => {});
    }

    return () => {
      io?.disconnect();
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
    />
  );
}
