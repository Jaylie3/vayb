import { Search, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-festival.jpg";

export const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-dark text-white">
    <div className="absolute inset-0">
      <img
        src={heroImg}
        alt="Festival crowd at sunset"
        width={1600}
        height={1024}
        className="h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background" />
      <div className="absolute inset-0 bg-glow" />
    </div>

    <div className="container relative pb-20 pt-16 md:pb-32 md:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md animate-fade-up">
          <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
          Tickets delivered straight to WhatsApp
        </div>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl animate-fade-up [animation-delay:80ms]">
          Find your next <span className="text-gradient-sunset">vayb</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/80 md:text-lg animate-fade-up [animation-delay:160ms]">
          Concerts, festivals, sports and markets across South Africa — discover, book, and arrive in two taps.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl shadow-pop animate-fade-up [animation-delay:240ms] sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
            <Search className="h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search events, artists, venues…"
              className="w-full bg-transparent text-sm placeholder:text-white/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 sm:w-44">
            <MapPin className="h-4 w-4 text-white/60" />
            <select className="w-full bg-transparent text-sm focus:outline-none [&>option]:text-foreground">
              <option>All cities</option>
              <option>Cape Town</option>
              <option>Johannesburg</option>
              <option>Durban</option>
              <option>Pretoria</option>
            </select>
          </div>
          <Button type="submit" variant="hero" size="lg" className="sm:w-auto">Search</Button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-white/70 animate-fade-up [animation-delay:320ms]">
          <span>⚡ Same-day organiser payouts</span>
          <span>💬 WhatsApp ticketing</span>
          <span>💸 Lowest buyer fees in SA</span>
        </div>
      </div>
    </div>
  </section>
);
