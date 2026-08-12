"use client";

export function VideoBackdrop({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <video
      className={className ?? "absolute inset-0 h-full w-full object-cover"}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
