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
  // Gauteng
  | "Johannesburg"
  | "Pretoria"
  | "Soweto"
  | "Centurion"
  | "Sandton"
  | "Vanderbijlpark"
  | "Vereeniging"
  | "Benoni"
  | "Boksburg"
  | "Brakpan"
  | "Germiston"
  | "Springs"
  | "Krugersdorp"
  | "Randfontein"
  // Western Cape
  | "Cape Town"
  | "Stellenbosch"
  | "Paarl"
  | "George"
  | "Knysna"
  | "Hermanus"
  | "Oudtshoorn"
  | "Worcester"
  | "Swellendam"
  | "Bellville"
  | "Somerset West"
  // KwaZulu-Natal
  | "Durban"
  | "Pietermaritzburg"
  | "Newcastle"
  | "Empangeni"
  | "Richards Bay"
  | "Pinetown"
  | "Umlazi"
  | "Mooi River"
  | "Howick"
  // Eastern Cape
  | "Gqeberha"
  | "East London"
  | "Bhisho"
  | "KuGompo City"
  | "Kariega"
  | "Mthatha"
  | "Makhanda"
  | "Graaff-Reinet"
  // Free State
  | "Bloemfontein"
  | "Welkom"
  | "Odendaalsrus"
  | "Sasolburg"
  | "Bethlehem"
  | "Kroonstad"
  | "Parys"
  | "Clarens"
  // Limpopo
  | "Polokwane"
  | "Musina"
  | "Phalaborwa"
  | "Thabazimbi"
  | "Makhado"
  | "Bela-Bela"
  | "Tzaneen"
  // Mpumalanga
  | "Mbombela"
  | "eMalahleni"
  | "Middelburg"
  | "Secunda"
  | "Ermelo"
  | "Standerton"
  | "Barberton"
  | "Sabie"
  // North West
  | "Rustenburg"
  | "Mahikeng"
  | "Klerksdorp"
  | "Potchefstroom"
  | "Brits"
  | "Hartbeespoort"
  | "Lichtenburg"
  | "Vryburg"
  // Northern Cape
  | "Kimberley"
  | "Upington"
  | "Springbok"
  | "De Aar"
  | "Kuruman";

export const SA_CITIES: SACity[] = [
  // Gauteng
  "Johannesburg",
  "Pretoria",
  "Soweto",
  "Centurion",
  "Sandton",
  "Vanderbijlpark",
  "Vereeniging",
  "Benoni",
  "Boksburg",
  "Brakpan",
  "Germiston",
  "Springs",
  "Krugersdorp",
  "Randfontein",
  // Western Cape
  "Cape Town",
  "Stellenbosch",
  "Paarl",
  "George",
  "Knysna",
  "Hermanus",
  "Oudtshoorn",
  "Worcester",
  "Swellendam",
  "Bellville",
  "Somerset West",
  // KwaZulu-Natal
  "Durban",
  "Pietermaritzburg",
  "Newcastle",
  "Empangeni",
  "Richards Bay",
  "Pinetown",
  "Umlazi",
  "Mooi River",
  "Howick",
  // Eastern Cape
  "Gqeberha",
  "East London",
  "Bhisho",
  "KuGompo City",
  "Kariega",
  "Mthatha",
  "Makhanda",
  "Graaff-Reinet",
  // Free State
  "Bloemfontein",
  "Welkom",
  "Odendaalsrus",
  "Sasolburg",
  "Bethlehem",
  "Kroonstad",
  "Parys",
  "Clarens",
  // Limpopo
  "Polokwane",
  "Musina",
  "Phalaborwa",
  "Thabazimbi",
  "Makhado",
  "Bela-Bela",
  "Tzaneen",
  // Mpumalanga
  "Mbombela",
  "eMalahleni",
  "Middelburg",
  "Secunda",
  "Ermelo",
  "Standerton",
  "Barberton",
  "Sabie",
  // North West
  "Rustenburg",
  "Mahikeng",
  "Klerksdorp",
  "Potchefstroom",
  "Brits",
  "Hartbeespoort",
  "Lichtenburg",
  "Vryburg",
  // Northern Cape
  "Kimberley",
  "Upington",
  "Springbok",
  "De Aar",
  "Kuruman",
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
