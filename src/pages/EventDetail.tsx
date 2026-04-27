import { Icon } from "@/components/Icon";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BUYER_FEE_RATE, categories, formatEventDate, formatZAR, getEvent } from "@/data/events";
import NotFound from "./NotFound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = id ? getEvent(id) : undefined;
  const [tierId, setTierId] = useState<string>(event?.tickets[0].id ?? "");
  const [qty, setQty] = useState(1);

  if (!event) return <NotFound />;

  const cat = categories.find((c) => c.slug === event.category);
  const d = formatEventDate(event.date);
  const tier = event.tickets.find((t) => t.id === tierId) ?? event.tickets[0];
  const subtotal = tier.price * qty;
  const fee = Math.round(subtotal * BUYER_FEE_RATE);
  const total = subtotal + fee;

  const goCheckout = () => {
    toast.success(`${qty} × ${tier.name} added`, { description: "Continue to checkout to confirm." });
    navigate(`/checkout/${event.id}?ticket=${tier.id}&qty=${qty}`);
  };

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header overlay />

      <main>
        {/* Hero */}
        <section className="relative -mt-16 h-[55vh] min-h-[420px] w-full overflow-hidden">
          <img src={event.image} alt={`${event.title} at ${event.venue}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background" aria-hidden />

          <div className="container relative flex h-full flex-col justify-end pb-10 pt-24 text-white">
            <Link
              to="/"
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium hover:bg-white/20"
            >
              <Icon name="arrow-left" className="h-3.5 w-3.5" /> Back to discover
            </Link>
            {cat && (
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full glass-dark px-3 py-1 text-xs font-medium">
                <Icon name={cat.icon} className="h-3.5 w-3.5" /> {cat.label}
              </span>
            )}
            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {event.title}
            </h1>
            <p className="mt-3 text-sm text-white/80">By {event.organiser}</p>
          </div>
        </section>

        {/* Body */}
        <section className="container grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-10">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: "calendar" as const, label: "Date", value: d.full, sub: d.time },
                { icon: "clock" as const, label: "Doors", value: event.doorsTime ?? d.time, sub: "Local time" },
                { icon: "map-pin" as const, label: "Venue", value: event.venue, sub: event.city },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-sunset text-white shadow-glow">
                    <Icon name={card.icon} className="h-4 w-4" />
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
                <Icon name="whatsapp" className="h-5 w-5" />
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
                <Icon name="share" className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          {/* Right — sticky ticket rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-pop">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="ticket" className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Choose your ticket</p>
              </div>

              <div className="space-y-2.5">
                {event.tickets.map((t) => {
                  const active = t.id === tierId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTierId(t.id)}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-smooth",
                        active
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border hover:border-primary/40 hover:bg-muted/40",
                      )}
                      aria-pressed={active}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display font-semibold">{t.name}</p>
                            {t.badge && (
                              <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                            {t.perks.map((p) => (
                              <li key={p}>· {p}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="font-display text-base font-bold">{formatZAR(t.price)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-background p-3">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                  >
                    <Icon name="minus" className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center font-display text-base font-semibold">{qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    disabled={qty >= 10}
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-5 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{qty} × {tier.name}</span>
                  <span>{formatZAR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Booking fee (3%)</span>
                  <span>{formatZAR(fee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display text-2xl font-bold text-gradient-sunset">{formatZAR(total)}</span>
                </div>
              </div>

              <Button variant="hero" size="lg" className="mt-5 w-full" onClick={goCheckout}>
                Get tickets · {formatZAR(total)}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="shield" className="h-3 w-3" /> Secure checkout · PayFast, card & EFT
              </p>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
