import { events } from "@/data/events";
import { EventCard } from "./EventCard";
import { Flame } from "lucide-react";

export const FeaturedEvents = () => {
  const trending = events.filter((e) => e.trending);
  const upcoming = events.filter((e) => !e.trending);

  return (
    <section className="container space-y-16 pb-20">
      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              <Flame className="h-3.5 w-3.5" /> Trending now
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Selling fast</h2>
          </div>
          <a href="#" className="hidden text-sm font-medium text-primary hover:underline sm:inline">View all →</a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Coming up</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Plans worth making</h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>
    </section>
  );
};
