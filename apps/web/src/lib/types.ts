export type Category = "parking" | "garage" | "storage" | "boat";

export interface CategoryMeta {
  key: Category;
  /** Swedish label shown in the UI */
  label: string;
  /** English gloss for non-Swedish readers */
  gloss: string;
  /** e.g. "kr / månad" vs "kr / dygn" hint */
  unitHint: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "parking", label: "Parkering", gloss: "Parking", unitHint: "plats" },
  { key: "garage", label: "Garage", gloss: "Garage", unitHint: "garage" },
  { key: "storage", label: "Förråd", gloss: "Storage", unitHint: "förråd" },
  { key: "boat", label: "Båtplats", gloss: "Boat berth", unitHint: "båtplats" },
];

export function categoryMeta(key: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

/** Presentation-only placeholder colors keyed by category. */
const CATEGORY_SWATCH: Record<Category, string> = {
  parking: "#2f6f57",
  garage: "#37506b",
  storage: "#6b5637",
  boat: "#31606b",
};

export function categorySwatch(key: Category): string {
  return CATEGORY_SWATCH[key] ?? "#2f6f57";
}

export interface Listing {
  id: string;
  title: string;
  category: Category;
  city: string;
  /** neighborhood / district */
  area: string;
  /** monthly price in SEK */
  pricePerMonth: number;
  sizeLabel?: string;
  covered: boolean;
  evCharging: boolean;
  access247: boolean;
  /** host has verified their right to sublet (landlord/BRF consent) */
  consentVerified: boolean;
  rating: number;
  reviewCount: number;
  hostName: string;
  lat: number;
  lng: number;
  description: string;
  /** hex color used for the placeholder image swatch */
  swatch: string;
  /** public URL of the uploaded cover photo, if any */
  coverUrl?: string;
  createdAt: string;
}

export interface ListingFilters {
  category?: Category;
  q?: string;
  maxPrice?: number;
}
