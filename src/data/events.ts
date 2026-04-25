import musicImg from "@/assets/event-music.jpg";
import foodImg from "@/assets/event-food.jpg";
import sportsImg from "@/assets/event-sports.jpg";
import conferenceImg from "@/assets/event-conference.jpg";
import comedyImg from "@/assets/event-comedy.jpg";
import festivalImg from "@/assets/event-festival.jpg";

export type Event = {
  id: string;
  title: string;
  category: string;
  city: string;
  venue: string;
  date: string; // ISO
  image: string;
  priceFrom: number;
  organiser: string;
  trending?: boolean;
  tickets: { id: string; name: string; price: number; perks: string[] }[];
  description: string;
};

export const categories = [
  { slug: "music", label: "Music", emoji: "🎶" },
  { slug: "festivals", label: "Festivals", emoji: "🎪" },
  { slug: "sports", label: "Sports", emoji: "🏟️" },
  { slug: "comedy", label: "Comedy", emoji: "🎤" },
  { slug: "food", label: "Food & Markets", emoji: "🍽️" },
  { slug: "conferences", label: "Conferences", emoji: "💼" },
];

export const events: Event[] = [
  {
    id: "afro-nights-jhb",
    title: "Afro Nights: Live in Joburg",
    category: "music",
    city: "Johannesburg",
    venue: "Constitution Hill",
    date: "2026-05-23T19:00:00+02:00",
    image: musicImg,
    priceFrom: 280,
    organiser: "Pulse Live SA",
    trending: true,
    description:
      "An unforgettable night of Afro-house, Amapiano and live percussion under the Joburg sky. Featuring six headline acts and a curated street-food village.",
    tickets: [
      { id: "ga", name: "General Access", price: 280, perks: ["Standing access", "Ticket to WhatsApp"] },
      { id: "vip", name: "VIP Lounge", price: 750, perks: ["Elevated viewing", "Welcome drink", "Fast entry"] },
      { id: "table", name: "Table of 6", price: 4200, perks: ["Reserved table", "Bottle service", "Private host"] },
    ],
  },
  {
    id: "table-mountain-fest",
    title: "Table Mountain Sunset Festival",
    category: "festivals",
    city: "Cape Town",
    venue: "Green Point Park",
    date: "2026-03-14T15:00:00+02:00",
    image: festivalImg,
    priceFrom: 450,
    organiser: "Cape Collective",
    trending: true,
    description:
      "Two stages, twelve hours of sound, and the most iconic backdrop in the country. Local and international acts curated for the perfect Cape Town summer.",
    tickets: [
      { id: "early", name: "Early Bird", price: 450, perks: ["Limited release", "WhatsApp ticket"] },
      { id: "ga", name: "General", price: 650, perks: ["Full festival access"] },
      { id: "vip", name: "VIP Deck", price: 1850, perks: ["Premium viewing", "Open bar 18:00–21:00", "Private toilets"] },
    ],
  },
  {
    id: "boks-vs-allblacks",
    title: "Springboks vs All Blacks",
    category: "sports",
    city: "Johannesburg",
    venue: "Emirates Airline Park",
    date: "2026-08-08T17:05:00+02:00",
    image: sportsImg,
    priceFrom: 320,
    organiser: "SA Rugby",
    description:
      "The fixture that stops the country. Watch the Boks take on the All Blacks live at Ellis. Get your seat before they vanish.",
    tickets: [
      { id: "north", name: "North Stand", price: 320, perks: ["Reserved seat"] },
      { id: "main", name: "Main Stand", price: 780, perks: ["Centre view", "Covered seating"] },
      { id: "hosp", name: "Hospitality Suite", price: 3200, perks: ["Buffet & bar", "Premium seating", "Concierge"] },
    ],
  },
  {
    id: "trevor-noah-cpt",
    title: "Trevor Noah: Off The Record",
    category: "comedy",
    city: "Cape Town",
    venue: "GrandWest Arena",
    date: "2026-04-18T20:00:00+02:00",
    image: comedyImg,
    priceFrom: 420,
    organiser: "Day1 Live",
    trending: true,
    description:
      "An intimate, off-the-cuff evening with Trevor Noah. New material, no recording, one night only.",
    tickets: [
      { id: "balcony", name: "Balcony", price: 420, perks: ["Reserved seat"] },
      { id: "stalls", name: "Stalls", price: 680, perks: ["Lower level"] },
      { id: "front", name: "Front Row", price: 1500, perks: ["First three rows", "Meet & greet entry"] },
    ],
  },
  {
    id: "neighbourgoods-market",
    title: "Neighbourgoods Night Market",
    category: "food",
    city: "Cape Town",
    venue: "Old Biscuit Mill",
    date: "2026-02-21T17:00:00+02:00",
    image: foodImg,
    priceFrom: 60,
    organiser: "Neighbourgoods",
    description:
      "60+ artisanal traders, live music, craft beer and the best street food in the Cape. A Saturday night ritual.",
    tickets: [
      { id: "entry", name: "Entry", price: 60, perks: ["Market access", "WhatsApp ticket"] },
      { id: "tasting", name: "Tasting Pass", price: 320, perks: ["10 tasting tokens", "Reusable cup"] },
    ],
  },
  {
    id: "africa-tech-summit",
    title: "Africa Tech Summit 2026",
    category: "conferences",
    city: "Johannesburg",
    venue: "Sandton Convention Centre",
    date: "2026-06-04T08:30:00+02:00",
    image: conferenceImg,
    priceFrom: 1850,
    organiser: "ATS",
    description:
      "Two days, 80 speakers, the founders and funders shaping Africa's tech decade. Workshops, demo stage and curated 1:1 meetings.",
    tickets: [
      { id: "day", name: "Day Pass", price: 1850, perks: ["Day 1 access", "Lunch included"] },
      { id: "full", name: "Full Summit", price: 3200, perks: ["Both days", "Workshop access", "Networking dinner"] },
      { id: "founder", name: "Founder Pass", price: 850, perks: ["Pre-revenue startups only", "Verification required"] },
    ],
  },
];

export const getEvent = (id: string) => events.find((e) => e.id === id);

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

export const formatEventDate = (iso: string) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-ZA", { day: "2-digit" }),
    month: d.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase(),
    full: d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
  };
};
