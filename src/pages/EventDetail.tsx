import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { TicketSelector } from "@/components/TicketSelector";
import { HeroSentinel } from "@/components/HeroSentinel";
import { categories } from "@/data/events";
import { formatEventDate, formatZAR, getEvent, BUYER_FEE_RATE } from "@/lib/events";
import NotFound from "./NotFound";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = id ? getEvent(id) : undefined;

  const firstAvailable = event?.tickets.find((t) => t.available) ?? event?.tickets[0];
  const [tierId, setTierId] = useState<string>(firstAvailable?.id ?? "");
  const [qty, setQty] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  if (!event) return <NotFound />;

  const cat = categories.find((c) => c.slug === event.category);
  const d = formatEventDate(event.date);
  const doors = event.doorsTime ? formatEventDate(event.doorsTime).time : d.time;
  const tier = event.tickets.find((t) => t.id === tierId) ?? event.tickets[0];
  const subtotal = tier.price * qty;
  const fee = Math.round(subtotal * BUYER_FEE_RATE);
  const total = subtotal + fee;

  const goCheckout = () => {
    setDrawerOpen(false);
    toast.success(`${qty} × ${tier.name} added`, { description: "Continue to checkout to confirm." });
    navigate(`/checkout/${event.slug}?ticket=${tier.id}&qty=${qty}`);
  };

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, url }); return; } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 h-[55vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={event.heroImage ?? event.image}
          alt={`${event.title} — ${event.venue}, ${event.city}`}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-hero-overlay" aria-hidden />

        <div className="container relative flex h-full flex-col justify-end pb-10 pt-24 text-white">
          <Link
            to="/"
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium hover:bg-white/20"
          >
            <Icon name="arrow-left" className="h-3.5 w-3.5" aria-hidden /> Back to discover
          </Link>
          {cat && (
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full glass-dark px-3 py-1 text-xs font-medium">
              <Icon name={cat.icon} className="h-3.5 w-3.5" aria-hidden /> {cat.label}
            </span>
          )}
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {event.title}
          </h1>
          <p className="mt-3 text-sm text-white/80">By {event.organiser}{event.organiserVerified && " · Verified"}</p>
        </div>
        <HeroSentinel />
      </section>

      {/* Body */}
      <section className="container grid gap-10 pb-32 pt-12 lg:grid-cols-[1fr_380px] lg:pb-12">
        <div className="space-y-10">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: "calendar" as const, label: "Date", value: d.full, sub: d.time },
              { icon: "clock" as const, label: "Doors", value: doors, sub: "Local time" },
              { icon: "map-pin" as const, label: "Venue", value: event.venue, sub: event.city },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-sunset text-white shadow-glow">
                  <Icon name={card.icon} className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                <p className="mt-1 font-display text-base font-semibold leading-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">About this event</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{event.description}</p>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-whatsapp/30 bg-whatsapp/10 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-whatsapp text-whatsapp-foreground shadow-card">
              <Icon name="whatsapp" className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-display font-semibold">Tickets delivered to WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                Your QR ticket lands on WhatsApp seconds after checkout. No email digging, no app downloads.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <span className="text-sm font-medium">Share this event</span>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Icon name="share" className="h-4 w-4" aria-hidden /> Share
            </Button>
          </div>
        </div>

        {/* Right rail (desktop only) */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-pop">
            <TicketSelector
              tiers={event.tickets}
              selectedTierId={tierId}
              quantity={qty}
              onTierChange={setTierId}
              onQuantityChange={setQty}
              onProceed={goCheckout}
            />
          </div>
        </aside>
      </section>

      {/* Mobile fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-5 py-3 shadow-pop backdrop-blur-xl lg:hidden">
        <div className="container flex items-center justify-between gap-3 px-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="font-display text-lg font-bold text-gradient-sunset">{formatZAR(total)}</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setDrawerOpen(true)}>
            Get tickets <Icon name="arrow-right" className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Close ticket selector"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 shadow-pop transition-transform duration-300",
            drawerOpen ? "translate-y-0" : "translate-y-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Choose your ticket"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" aria-hidden />
          <TicketSelector
            tiers={event.tickets}
            selectedTierId={tierId}
            quantity={qty}
            onTierChange={setTierId}
            onQuantityChange={setQty}
            onProceed={goCheckout}
            compact
          />
        </div>
      </div>

      {/* unused inline calc keeps subtotal/fee available for the bar above */}
      <span className="hidden">{subtotal}{fee}</span>
    </>
  );
};

export default EventDetail;
