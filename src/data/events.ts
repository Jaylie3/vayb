import type { EventCategory } from "@/types/events";

/* Re-export types & helpers so existing imports keep working. */
export type { Event, TicketTier, EventCategory, SACity } from "@/types/events";
export {
  BUYER_BOOKING_FEE_PER_TICKET,
  calcBookingFee,
  formatZAR,
  formatEventDate,
} from "@/lib/events";

export const categories: ReadonlyArray<{
  slug: EventCategory;
  label: string;
  icon: "music" | "star" | "trophy" | "microphone" | "cart" | "briefcase";
}> = [
  { slug: "music", label: "Music", icon: "music" },
  { slug: "festivals", label: "Festivals", icon: "star" },
  { slug: "sports", label: "Sports", icon: "trophy" },
  { slug: "comedy", label: "Comedy", icon: "microphone" },
  { slug: "food", label: "Food & Markets", icon: "cart" },
  { slug: "conferences", label: "Conferences", icon: "briefcase" },
];

import { SA_CITIES } from "@/types/events";

export const cities = ["All cities", ...SA_CITIES] as const;
