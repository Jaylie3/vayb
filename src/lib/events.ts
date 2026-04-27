import type { Event, EventCategory, SACity } from "@/types/events";
import { events } from "@/data/events";

export const BUYER_FEE_RATE = 0.03;

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

export const getEvent = (id: string): Event | undefined =>
  events.find((e) => e.slug === id || e.id === id);

export const getRelatedEvents = (event: Event, limit = 3): Event[] => {
  const others = events.filter((e) => e.id !== event.id);
  const sameCat = others.filter((e) => e.category === event.category);
  const sameCity = others.filter((e) => e.city === event.city && e.category !== event.category);
  const rest = others.filter((e) => !sameCat.includes(e) && !sameCity.includes(e));
  return [...sameCat, ...sameCity, ...rest].slice(0, limit);
};

export const filterEvents = (category?: EventCategory | null, city?: SACity | null): Event[] =>
  events.filter(
    (e) => (!category || e.category === category) && (!city || e.city === city),
  );
