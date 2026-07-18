import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Platsdela — förhyrda platser",
    short_name: "Platsdela",
    description:
      "Hyr ut och hitta förhyrda platser: parkering, garage, förråd och båtplatser.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#1f7a5c",
    lang: "sv",
    categories: ["travel", "utilities", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
