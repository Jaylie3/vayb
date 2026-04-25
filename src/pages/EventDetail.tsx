import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, ArrowLeft, MessageCircle, Share2, Minus, Plus, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getEvent, formatEventDate, formatZAR } from "@/data/events";
import { toast } from "@/hooks/use-toast";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = id ? getEvent(id) : undefined;
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Event not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back to discover</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const d = formatEventDate(event.date);
  const ticket = event.tickets[selected];
  const subtotal = ticket.price * qty;
  const fee = Math.round(subtotal * 0.03);
  const total = subtotal + fee;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
          <div className="container relative flex h-full flex-col justify-between py-6">
            <button onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-md transition-smooth hover:bg-background">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="max-w-3xl">
              <span className="inline-block rounded-full bg-secondary/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground backdrop-blur">
                {event.category}
              </span>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                {event.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">By {event.organiser}</p>
            </div>
          </div>
        </section>

        <section className="container grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Calendar, label: "Date", value: d.full },
                { icon: Clock, label: "Doors", value: d.time },
                { icon: MapPin, label: "Venue", value: `${event.venue}, ${event.city}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-border bg-gradient-card p-4 shadow-card">
                  <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold">About this event</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{event.description}</p>
            </div>

            <div className="rounded-2xl border border-whatsapp/30 bg-whatsapp/5 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-whatsapp text-whatsapp-foreground">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Tickets delivered via WhatsApp</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your QR ticket and reminders arrive in chat — share with friends and scan at the door from your phone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="gap-2">
                <Share2 className="h-4 w-4" /> Share event
              </Button>
            </div>
          </div>

          {/* Sticky ticket selector */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-pop">
              <h3 className="font-display text-lg font-bold">Choose your ticket</h3>
              <div className="mt-4 space-y-2">
                {event.tickets.map((t, i) => {
                  const active = i === selected;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelected(i)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-smooth ${
                        active
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold">{t.name}</span>
                        <span className="font-display font-bold text-primary">{formatZAR(t.price)}</span>
                      </div>
                      <ul className="mt-2 space-y-0.5">
                        {t.perks.map((p) => (
                          <li key={p} className="text-xs text-muted-foreground">• {p}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-muted p-3">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center font-display font-bold">{qty}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty((q) => Math.min(10, q + 1))}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>{formatZAR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Booking fee (3%)</span><span>{formatZAR(fee)}</span>
                </div>
                <div className="flex justify-between pt-2 font-display text-lg font-bold">
                  <span>Total</span><span className="text-gradient-sunset">{formatZAR(total)}</span>
                </div>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="mt-5 w-full"
                onClick={() => {
                  toast({ title: "Heading to checkout", description: `${qty} × ${ticket.name}` });
                  navigate(`/checkout/${event.id}?ticket=${ticket.id}&qty=${qty}`);
                }}
              >
                Get tickets · {formatZAR(total)}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Secure checkout · PayFast, card & EFT
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
