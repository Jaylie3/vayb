import type { Event } from "@/types/events";

// Buyers pay a flat R5.00 booking fee per ticket. Organisers cover the 3% commission.
export const BUYER_BOOKING_FEE_PER_TICKET = 5;
export const calcBookingFee = (quantity: number): number =>
  BUYER_BOOKING_FEE_PER_TICKET * Math.max(0, quantity);

export const formatZAR = (rands: number): string =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rands);

export type FormattedEventDate = {
  day: string;
  month: string;
  full: string;
  time: string;
  dayOfWeek: string;
};

export const formatEventDate = (iso: string): FormattedEventDate => {
  const d = new Date(iso);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-ZA", opts).format(d);
  return {
    day: fmt({ day: "2-digit" }),
    month: fmt({ month: "short" }).toUpperCase(),
    full: fmt({ weekday: "short", day: "numeric", month: "long", year: "numeric" }),
    time: fmt({ hour: "2-digit", minute: "2-digit", hour12: false }),
    dayOfWeek: fmt({ weekday: "long" }),
  };
};

/** Pick related events from a preloaded list. */
export const getRelatedEvents = (event: Event, all: Event[], limit = 3): Event[] => {
  const others = all.filter((e) => e.id !== event.id);
  const sameCat = others.filter((e) => e.category === event.category);
  const sameCity = others.filter((e) => e.city === event.city && e.category !== event.category);
  const rest = others.filter((e) => !sameCat.includes(e) && !sameCity.includes(e));
  return [...sameCat, ...sameCity, ...rest].slice(0, limit);
};
