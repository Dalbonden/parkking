import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getListings } from "@/lib/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/listings`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/list-space`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/villkor`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/sign-in`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Public, active listings only (getListings filters to status='active').
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const listings = await getListings();
    listingRoutes = listings.map((l) => ({
      url: `${SITE_URL}/listings/${l.id}`,
      lastModified: l.createdAt ? new Date(l.createdAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // A sitemap must still render if the DB is briefly unreachable.
  }

  return [...staticRoutes, ...listingRoutes];
}
