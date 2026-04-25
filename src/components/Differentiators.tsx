import { Zap, MessageCircle, PiggyBank, Compass } from "lucide-react";

const items = [
  { icon: Zap, title: "Same-day payouts", desc: "Organisers get paid the day tickets sell — not weeks later." },
  { icon: MessageCircle, title: "WhatsApp tickets", desc: "Tickets land in your chats. No app downloads, no lost emails." },
  { icon: PiggyBank, title: "Lower buyer fees", desc: "We charge a flat 3% — half the SA average. More gigs, less mark-up." },
  { icon: Compass, title: "Built for discovery", desc: "Find events by city, vibe and friends going. Like a feed, but for plans." },
];

export const Differentiators = () => (
  <section className="border-y border-border/60 bg-muted/30">
    <div className="container grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="group flex gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-sunset text-primary-foreground shadow-glow transition-bounce group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
