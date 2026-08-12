import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RRise — Rise. Build. Become.",
    short_name: "RRise",
    description:
      "A premium personal development workspace. Track habits, smash goals, and level up.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#000000",
    theme_color: "#8052ff",
    categories: ["productivity", "lifestyle", "education"],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/app/dashboard",
      },
      {
        name: "AI Chat",
        url: "/app/chat",
      },
    ],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
