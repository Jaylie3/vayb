/**
 * Vayb domain types. Strict — no `any` permitted.
 *
 * Currency convention: `price` and `priceFrom` are stored as whole ZAR (rands),
 * not cents. All formatting goes through {@link formatZAR}.
 */

export type EventCategory =
  | "music"
  | "festivals"
  | "sports"
  | "comedy"
  | "food"
  | "conferences";

export type SACity =
  | "Cape Town"
  | "Johannesburg"
  | "Durban"
  | "Pretoria"
  | "Gqeberha"
  | "East London"
  | "Bloemfontein"
  | "Polokwane"
  | "Mbombela"
  | "Kimberley"
  | "Pietermaritzburg"
  | "Stellenbosch"
  | "George"
  | "Rustenburg"
  | "Soweto"
  | "Centurion"
  | "Sandton"
  | "Knysna"
  | "Hermanus"
  | "Paarl"
  | "Potchefstroom"
  | "Upington";

export const SA_CITIES: SACity[] = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Sandton",
  "Centurion",
  "Soweto",
  "Gqeberha",
  "East London",
  "Bloemfontein",
  "Pietermaritzburg",
  "Polokwane",
  "Mbombela",
  "Kimberley",
  "Rustenburg",
  "Potchefstroom",
  "Stellenbosch",
  "Paarl",
  "George",
  "Knysna",
  "Hermanus",
  "Upington",
];

export type TicketTier = {
  id: string;
  name: string;
  /** Price in whole ZAR (rands). */
  price: number;
  capacity?: number;
  perks: string[];
  /** Display badge (e.g. "Selling fast", "Most popular"). */
  badge?: string;
  /** false → tier is sold out; selector greys it out. */
  available: boolean;
};

export type Event = {
  id: string;
  /** URL-safe slug — matches the `:id` route param. */
  slug: string;
  title: string;
  subtitle?: string;
  category: EventCategory;
  city: SACity;
  venue: string;
  venueAddress?: string;
  /** ISO 8601 with +02:00 SAST offset. */
  date: string;
  /** ISO 8601 doors-open time. */
  doorsTime?: string;
  image: string;
  /** Wider crop for the detail-page hero; falls back to `image`. */
  heroImage?: string;
  /** Minimum visible ticket price in ZAR. */
  priceFrom: number;
  organiser: string;
  organiserVerified?: boolean;
  trending?: boolean;
  tags?: string[];
  description: string;
  tickets: TicketTier[];
};
