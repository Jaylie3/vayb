import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Check, CreditCard, Landmark, MapPin, MessageCircle, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUYER_FEE_RATE, formatEventDate, formatZAR, getEvent } from "@/data/events";
import NotFound from "./NotFound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = "details" | "payment" | "success";
type Method = "card" | "payfast" | "eft";

const Checkout = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const event = id ? getEvent(id) : undefined;

  const tierIdParam = params.get("ticket");
  const qtyParam = Math.min(10, Math.max(1, Number(params.get("qty") ?? 1) || 1));

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [promo, setPromo] = useState("");
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [loading, setLoading] = useState(false);

  if (!event) return <NotFound />;

  const tier = event.tickets.find((t) => t.id === tierIdParam) ?? event.tickets[0];
  const d = formatEventDate(event.date);
  const subtotal = tier.price * qtyParam;
  const fee = Math.round(subtotal * BUYER_FEE_RATE);
  const total = subtotal + fee;

  const validDetails = name.trim().length > 1 && email.includes("@") && whatsapp.replace(/\D/g, "").length >= 9;

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validDetails) {
      toast.error("Please complete all required fields");
      return;
    }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Payment confirmed", { description: "Your tickets are on their way to WhatsApp." });
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-10 lg:py-14">
        {/* Steps indicator */}
        {step !== "success" && (
          <div className="mx-auto mb-8 flex max-w-md items-center justify-between">
            {(["details", "payment", "success"] as Step[]).slice(0, 2).map((s, i, arr) => {
              const idx = arr.indexOf(s);
              const currentIdx = step === "details" ? 0 : 1;
              const active = idx === currentIdx;
              const done = idx < currentIdx;
              return (
                <div key={s} className="flex flex-1 items-center gap-2 last:flex-none">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-smooth",
                      active && "bg-gradient-sunset text-white shadow-glow",
                      done && "bg-success text-success-foreground",
                      !active && !done && "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn("text-sm font-medium capitalize", active ? "text-foreground" : "text-muted-foreground")}>
                    {s}
                  </span>
                  {i < 1 && <div className="h-px flex-1 bg-border" />}
                </div>
              );
            })}
          </div>
        )}

        {step === "success" ? (
          <SuccessPanel event={event} tier={tier} qty={qtyParam} total={total} whatsapp={whatsapp || "+27 ••• •••• "} d={d} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="order-2 lg:order-1">
              {step === "details" ? (
                <form onSubmit={submitDetails} className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Your details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">We'll send your tickets to your WhatsApp.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Lerato Khumalo" required className="mt-1.5 rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="mt-1.5 rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5 text-whatsapp" /> WhatsApp number
                      </Label>
                      <Input
                        id="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+27 82 123 4567"
                        required
                        className="mt-1.5 rounded-xl"
                      />
                      <p className="mt-1.5 text-xs text-whatsapp">Your tickets will be sent here.</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="promo">Promo code <span className="text-muted-foreground">(optional)</span></Label>
                    <Input id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="VAYB10" className="mt-1.5 rounded-xl" />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Continue to payment <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={pay} className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-bold">Payment</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Pick your preferred method.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: "card" as Method, label: "Card", icon: CreditCard, sub: "Visa · Mastercard" },
                      { id: "payfast" as Method, label: "PayFast", icon: Sparkles, sub: "Instant EFT" },
                      { id: "eft" as Method, label: "EFT", icon: Landmark, sub: "Manual transfer" },
                    ].map((m) => {
                      const active = method === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id)}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition-smooth",
                            active ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40",
                          )}
                        >
                          <m.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                          <p className="mt-2 font-display font-semibold">{m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.sub}</p>
                        </button>
                      );
                    })}
                  </div>

                  {method === "card" && (
                    <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-5">
                      <div>
                        <Label htmlFor="cc">Card number</Label>
                        <Input id="cc" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="mt-1.5 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="exp">Expiry</Label>
                          <Input id="exp" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM / YY" className="mt-1.5 rounded-xl" />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="mt-1.5 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  )}

                  {method === "payfast" && (
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                      You'll be redirected to PayFast to complete an instant EFT.
                    </div>
                  )}
                  {method === "eft" && (
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                      We'll email you our banking details. Tickets release once payment clears (usually 1 business day).
                    </div>
                  )}

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Processing…" : `Pay ${formatZAR(total)}`}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> 256-bit encrypted · No card details stored
                  </p>
                </form>
              )}
            </div>

            <OrderSummary event={event} tier={tier} qty={qtyParam} subtotal={subtotal} fee={fee} total={total} d={d} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const OrderSummary = ({ event, tier, qty, subtotal, fee, total, d }: any) => (
  <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
    <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-pop">
      <div className="relative h-32 w-full overflow-hidden">
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Your order</p>
          <p className="line-clamp-1 font-display text-base font-bold">{event.title}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-1.5 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {d.full} · {d.time}</p>
          <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {event.venue}, {event.city}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><Ticket className="h-4 w-4 text-primary" /> {qty} × {tier.name}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            {tier.perks.map((p: string) => <li key={p}>· {p}</li>)}
          </ul>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Booking fee (3%)</span><span>{formatZAR(fee)}</span></div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-display font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-gradient-sunset">{formatZAR(total)}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
);

const SuccessPanel = ({ event, tier, qty, total, whatsapp, d }: any) => (
  <div className="mx-auto max-w-2xl text-center">
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-sunset shadow-glow">
      <Check className="h-9 w-9 text-white" />
      <span className="absolute inset-0 animate-pulse-glow rounded-full bg-gradient-sunset opacity-50 blur-xl" aria-hidden />
    </div>
    <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl">You're in! 🎉</h1>
    <p className="mt-3 text-muted-foreground">
      We've sent your QR ticket to WhatsApp <span className="font-semibold text-foreground">{whatsapp}</span>.
      See you at <span className="font-semibold text-foreground">{event.title}</span>.
    </p>

    <div className="mx-auto mt-8 overflow-hidden rounded-3xl border border-border bg-gradient-card text-left shadow-pop">
      <div className="bg-gradient-sunset p-5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-90">Vayb ticket</p>
        <p className="font-display text-xl font-bold">{event.title}</p>
        <p className="text-sm opacity-90">{d.full} · {d.time}</p>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-[140px_1fr] sm:items-center">
        <div className="mx-auto h-32 w-32 rounded-2xl border border-border bg-[conic-gradient(from_45deg,hsl(var(--foreground))_0_25%,transparent_0_50%,hsl(var(--foreground))_0_75%,transparent_0)] bg-[length:14px_14px] [background-position:0_0,7px_7px]" aria-label="Mock QR code" />
        <div className="space-y-1.5 text-sm">
          <p><span className="text-muted-foreground">Holder:</span> <span className="font-semibold">You</span></p>
          <p><span className="text-muted-foreground">Tier:</span> <span className="font-semibold">{qty} × {tier.name}</span></p>
          <p><span className="text-muted-foreground">Venue:</span> <span className="font-semibold">{event.venue}, {event.city}</span></p>
          <p><span className="text-muted-foreground">Total paid:</span> <span className="font-semibold text-gradient-sunset">{formatZAR(total)}</span></p>
        </div>
      </div>
    </div>

    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Button asChild variant="hero" size="lg">
        <Link to="/">Browse more events <ArrowRight className="h-4 w-4" /></Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link to={`/events/${event.id}`}><ArrowLeft className="h-4 w-4" /> Back to event</Link>
      </Button>
    </div>
  </div>
);

export default Checkout;
