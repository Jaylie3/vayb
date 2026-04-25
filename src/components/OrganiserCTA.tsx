import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const OrganiserCTA = () => (
  <section id="organisers" className="container pb-24">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-8 text-white shadow-pop md:p-16">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-sunset opacity-40 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-gradient-aurora opacity-30 blur-3xl animate-pulse-glow [animation-delay:1s]" />

      <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">For organisers</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
            Get paid the day they buy.
          </h2>
          <p className="mt-4 text-white/80 md:text-lg">
            Stop waiting weeks for your money. Vayb pays out daily, with built-in marketing tools, WhatsApp delivery, and a fee structure that doesn't punish your fans.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="lg">Start selling tickets</Button>
            <Button variant="glass" size="lg">See pricing</Button>
          </div>
        </div>
        <ul className="grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
          {[
            "Same-day payouts via EFT",
            "Flat 3% buyer fee, 0% organiser fee",
            "WhatsApp ticket delivery & reminders",
            "Built-in referrals, ads & email tools",
            "Real-time scan-in app for door staff",
            "Live sales dashboard & exportable reports",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/90">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-sunset">
                <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
