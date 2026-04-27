import { Button } from "@/components/ui/button";
import { Icon } from "./Icon";

const benefits = [
  "Same-day EFT payouts",
  "Flat 3% buyer fee, 0% to you",
  "WhatsApp ticket delivery",
  "Built-in referrals, ads & email",
  "Scan-in app for the door",
  "Live sales dashboard",
];

export const OrganiserCTA = () => (
  <section id="organisers" className="container py-20">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-8 shadow-pop sm:p-14">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl animate-blob" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl animate-blob [animation-delay:3s]" aria-hidden />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-56 w-56 rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:6s]" aria-hidden />

      <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-glow">For organisers</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] sm:text-5xl">
            Get paid the day{" "}
            <span className="text-gradient-sunset">they buy.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/80">
            Stop waiting a week for your money. Vayb pays out same-day, charges your fans less, and gives you the marketing tools to actually fill the room.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="hero" size="lg">
              List your event <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="lg">See pricing</Button>
          </div>
        </div>

        <ul className="grid gap-3 rounded-3xl glass p-5 sm:p-7 sm:grid-cols-2">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-white">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-sunset text-white shadow-glow">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
