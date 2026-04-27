import { categories } from "@/data/events";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Icon } from "./Icon";

type Props = {
  active?: string | null;
  onChange?: (slug: string | null) => void;
};

export const Categories = ({ active: activeProp, onChange }: Props) => {
  const [internal, setInternal] = useState<string | null>(null);
  const active = activeProp !== undefined ? activeProp : internal;

  const set = (slug: string | null) => {
    if (onChange) onChange(slug);
    else setInternal(slug);
  };

  return (
    <section id="categories" className="container pt-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Browse</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">What's your vayb?</h2>
        </div>
        {active && (
          <button
            onClick={() => set(null)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {categories.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.slug}
              onClick={() => set(isActive ? null : c.slug)}
              className={cn(
                "group flex shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl border px-5 py-5 text-center transition-bounce lg:shrink",
                isActive
                  ? "border-transparent bg-gradient-sunset text-white shadow-glow"
                  : "border-border bg-card hover:-translate-y-1 hover:shadow-pop hover:border-primary/30",
              )}
            >
              <Icon name={c.icon} className="h-7 w-7 transition-bounce group-hover:scale-110" />
              <span className="text-sm font-semibold">{c.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
