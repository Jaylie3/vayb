import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImg from "@/assets/hero-festival.jpg";
import { cities } from "@/data/events";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { HeroSentinel } from "./HeroSentinel";

export const Hero = () => {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All cities");
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/#featured");
  };

  return (
    <section className="relative -mt-16 min-h-[88vh] overflow-hidden">
      <img
        src={heroImg}
        alt="South African festival crowd at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-dark opacity-80" aria-hidden />
      <div className="absolute inset-0 bg-glow opacity-90" aria-hidden />
      <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-secondary/30 blur-3xl animate-blob" aria-hidden />
      <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob [animation-delay:2s]" aria-hidden />

      <div className="container relative flex min-h-[88vh] flex-col justify-center pb-20 pt-28 text-white">
        <div className="max-w-3xl">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-primary-glow" />
            Tickets delivered straight to WhatsApp
          </span>

          <h1 className="mt-6 animate-fade-up font-display text-4xl font-bold leading-[1.05] tracking-tight delay-75 sm:text-6xl lg:text-7xl">
            Find your next{" "}
            <span className="text-gradient-sunset">vayb.</span>
          </h1>

          <p className="mt-5 max-w-xl animate-fade-up text-base text-white/80 delay-150 sm:text-lg">
            Concerts, festivals, sports, comedy and markets across South Africa — discovered, booked and delivered to your phone in seconds.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-8 flex w-full max-w-2xl animate-fade-up flex-col gap-2 rounded-2xl glass p-2 shadow-pop delay-225 sm:flex-row sm:items-center sm:rounded-full"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Icon name="search" className="h-4 w-4 text-white/70" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, artists, venues…"
                className="h-11 border-0 bg-transparent px-0 text-white placeholder:text-white/60 focus-visible:ring-0"
                aria-label="Search events"
              />
            </div>
            <div className="flex items-center gap-2 sm:border-l sm:border-white/15 sm:pl-2">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  className="h-11 w-full gap-2 border-0 bg-transparent text-white sm:w-[160px]"
                  aria-label="Select city"
                >
                  <Icon name="map-pin" className="h-4 w-4 text-white/70" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="hero" size="lg" className="h-11">
                <Icon name="search" className="h-4 w-4" /> Search
              </Button>
            </div>
          </form>

          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75 delay-300">
            <span className="inline-flex items-center gap-2"><Icon name="flash" className="h-4 w-4 text-primary-glow" /> Same-day payouts</span>
            <span className="inline-flex items-center gap-2"><Icon name="whatsapp" className="h-4 w-4 text-whatsapp" /> WhatsApp ticketing</span>
            <span className="inline-flex items-center gap-2"><Icon name="currency" className="h-4 w-4 text-primary-glow" /> Lowest buyer fees in SA</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" aria-hidden />
    </section>
  );
};
