import { useState, useMemo } from "react";
import { events } from "@/data/events";
import { EventCard } from "./EventCard";
import { Categories } from "./Categories";
import { Icon } from "./Icon";

export const FeaturedEvents = () => {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter ? events.filter((e) => e.category === filter) : events),
    [filter],
  );

  const trending = filtered.filter((e) => e.trending);
  const upcoming = filtered.filter((e) => !e.trending);

  return (
    <>
      <Categories active={filter} onChange={setFilter} />
      <section id="featured" className="container space-y-16 py-16">
        {trending.length > 0 && (
          <div>
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  <Icon name="trending" className="h-3.5 w-3.5" /> Trending this week
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Selling fast</h2>
              </div>
              <a href="#" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
                View all →
              </a>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((e, i) => (
                <div key={e.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Coming up</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Plans worth making</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e, i) => (
                <div key={e.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No events in this category yet. Check back soon.</p>
          </div>
        )}
      </section>
    </>
  );
};
