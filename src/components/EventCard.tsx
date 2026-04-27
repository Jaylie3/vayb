import { Link } from "react-router-dom";
import { MapPin, Flame } from "lucide-react";
import { type Event, formatEventDate, formatZAR, categories } from "@/data/events";

export const EventCard = ({ event }: { event: Event }) => {
  const d = formatEventDate(event.date);
  const cat = categories.find((c) => c.slug === event.category);
  return (
    <Link
      to={`/events/${event.id}`}
      className="group block overflow-hidden rounded-3xl bg-card shadow-card transition-bounce hover:-translate-y-1.5 hover:shadow-pop"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={`${event.title} at ${event.venue}`}
          loading="lazy"
          className="h-full w-full object-cover transition-bounce group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden />

        {/* Date badge */}
        <div className="absolute left-4 top-4 flex flex-col items-center rounded-2xl bg-gradient-sunset px-3 py-2 text-white shadow-glow">
          <span className="text-[10px] font-bold leading-none tracking-widest">{d.month}</span>
          <span className="font-display text-xl font-bold leading-none">{d.day}</span>
        </div>

        {event.trending && (
          <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow-pop">
            <Flame className="h-3 w-3" /> Trending
          </div>
        )}

        {cat && (
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full glass-dark px-3 py-1 text-xs font-medium text-white">
            <span>{cat.emoji}</span>
            {cat.label}
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug transition-smooth group-hover:text-primary">
          {event.title}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {event.venue}, {event.city}
        </p>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">From</p>
            <p className="font-display text-lg font-bold text-gradient-sunset">{formatZAR(event.priceFrom)}</p>
          </div>
          <span className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-bounce group-hover:bg-gradient-sunset group-hover:text-white">
            Get tickets →
          </span>
        </div>
      </div>
    </Link>
  );
};
