import { Icon, type IconName } from "./Icon";

const items: { icon: IconName; title: string; body: string }[] = [
  { icon: "flash", title: "Same-day payouts", body: "Funds in your account the day fans buy. No 7-day waits." },
  { icon: "whatsapp", title: "WhatsApp tickets", body: "Tickets delivered to the app every South African already uses." },
  { icon: "piggy", title: "Lower buyer fees", body: "A flat 3% to fans. 0% to organisers. Honest pricing, finally." },
  { icon: "compass", title: "Built for discovery", body: "Curated by city, mood and moment — not buried in a list." },
];

export const Differentiators = () => (
  <section className="bg-muted/50 py-20">
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why Vayb</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Built for fans. <span className="text-gradient-sunset">Loved by organisers.</span>
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="group relative overflow-hidden rounded-3xl bg-card p-6 shadow-card transition-bounce hover:-translate-y-1 hover:shadow-pop animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunset text-white shadow-glow">
              <Icon name={it.icon} className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold">{it.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-aurora opacity-0 blur-2xl transition-smooth group-hover:opacity-30" />
          </div>
        ))}
      </div>
    </div>
  </section>
);
