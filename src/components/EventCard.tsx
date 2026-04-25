import { Link } from "react-router-dom";
import { MapPin, TrendingUp } from "lucide-react";
import { Event, formatEventDate, formatZAR } from "@/data/events";

export const EventCard = ({ event }: { event: Event }) => {
  const d = formatEventDate(event.date);
  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-card shadow-card transition-bounce hover:-translate-y-1 hover:shadow-pop"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-smooth group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-background/95 px-3 py-2 text-center shadow-soft">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{d.month}</span>
          <span className="font-display text-xl font-bold leading-none">{d.day}</span>
        </div>
        {event.trending && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground shadow-pop">
            <TrendingUp className="h-3 w-3" /> Trending
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight transition-smooth group-hover:text-primary">
          {event.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {event.venue}, {event.city}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
            <p className="font-display text-lg font-bold text-gradient-sunset">{formatZAR(event.priceFrom)}</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {event.category}
          </span>
        </div>
      </div>
    </Link>
  );
};
