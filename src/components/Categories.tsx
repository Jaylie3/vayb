import { categories } from "@/data/events";

export const Categories = () => (
  <section id="categories" className="container py-16">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Browse by category</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">What's your vayb?</h2>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((c) => (
        <a
          key={c.slug}
          href={`#${c.slug}`}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-gradient-card p-5 text-center transition-bounce hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
        >
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-muted text-3xl transition-bounce group-hover:bg-gradient-sunset group-hover:scale-110">
            {c.emoji}
          </span>
          <span className="font-display text-sm font-semibold">{c.label}</span>
        </a>
      ))}
    </div>
  </section>
);
