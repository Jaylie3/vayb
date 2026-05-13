import { supabase } from "@/integrations/supabase/client";
import type { Event, EventCategory, SACity, TicketTier } from "@/types/events";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: EventCategory;
  city: SACity;
  venue: string;
  venue_address: string | null;
  date: string;
  doors_time: string | null;
  image: string;
  hero_image: string | null;
  price_from: number;
  organiser: string;
  organiser_verified: boolean;
  trending: boolean;
  tags: string[];
  description: string;
  ticket_tiers: {
    id: string;
    name: string;
    price: number;
    capacity: number | null;
    perks: string[];
    badge: string | null;
    available: boolean;
    sort_order: number;
  }[];
};

const mapTier = (t: EventRow["ticket_tiers"][number]): TicketTier => ({
  id: t.id,
  name: t.name,
  price: t.price,
  capacity: t.capacity ?? undefined,
  perks: t.perks ?? [],
  badge: t.badge ?? undefined,
  available: t.available,
});

const mapEvent = (row: EventRow): Event => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  subtitle: row.subtitle ?? undefined,
  category: row.category,
  city: row.city,
  venue: row.venue,
  venueAddress: row.venue_address ?? undefined,
  date: row.date,
  doorsTime: row.doors_time ?? undefined,
  image: row.image,
  heroImage: row.hero_image ?? undefined,
  priceFrom: row.price_from,
  organiser: row.organiser,
  organiserVerified: row.organiser_verified,
  trending: row.trending,
  tags: row.tags ?? [],
  description: row.description,
  tickets: [...(row.ticket_tiers ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapTier),
});

const SELECT = `
  id, slug, title, subtitle, category, city, venue, venue_address,
  date, doors_time, image, hero_image, price_from, organiser,
  organiser_verified, trending, tags, description,
  ticket_tiers ( id, name, price, capacity, perks, badge, available, sort_order )
`;

export const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select(SELECT)
    .order("date", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as EventRow[]).map(mapEvent);
};

export const fetchEvent = async (slugOrId: string): Promise<Event | null> => {
  const isUuid = /^[0-9a-f-]{36}$/i.test(slugOrId);
  const { data, error } = await supabase
    .from("events")
    .select(SELECT)
    .eq(isUuid ? "id" : "slug", slugOrId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEvent(data as unknown as EventRow) : null;
};
