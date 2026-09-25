import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lottery Sambad Plus – Live Results",
    short_name: "Sambad Plus",
    description: "Lottery Sambad 1 PM, 6 PM & 8 PM results – fast and updated live.",
    start_url: "/",
    display: "standalone",
    background_color: "#061a44",
    theme_color: "#061a44",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
