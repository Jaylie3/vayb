import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useReducer } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEventDate, formatZAR, getEvent, calcBookingFee, BUYER_BOOKING_FEE_PER_TICKET } from "@/lib/events";
import type { Event, TicketTier } from "@/types/events";
import NotFound from "./NotFound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type CheckoutStep = "details" | "payment" | "success";
type PaymentMethod = "card" | "payfast" | "eft";

type CheckoutState = {
  step: CheckoutStep;
  name: string;
  email: string;
  whatsapp: string;
  promoCode: string;
  promoApplied: boolean;
  paymentMethod: PaymentMethod;
  card: { number: string; expiry: string; cvc: string };
  isProcessing: boolean;
  touched: { name: boolean; email: boolean; whatsapp: boolean };
  attempted: boolean;
};

type Action =
  | { type: "set"; field: "name" | "email" | "whatsapp" | "promoCode"; value: string }
  | { type: "blur"; field: "name" | "email" | "whatsapp" }
  | { type: "set-method"; value: PaymentMethod }
  | { type: "set-card"; field: "number" | "expiry" | "cvc"; value: string }
  | { type: "apply-promo" }
  | { type: "attempt-details" }
  | { type: "go"; step: CheckoutStep }
  | { type: "processing"; value: boolean };

const initialState: CheckoutState = {
  step: "details",
  name: "",
  email: "",
  whatsapp: "",
  promoCode: "",
  promoApplied: false,
  paymentMethod: "card",
  card: { number: "", expiry: "", cvc: "" },
  isProcessing: false,
  touched: { name: false, email: false, whatsapp: false },
  attempted: false,
};

function reducer(s: CheckoutState, a: Action): CheckoutState {
  switch (a.type) {
    case "set": return { ...s, [a.field]: a.value };
    case "blur": return { ...s, touched: { ...s.touched, [a.field]: true } };
    case "set-method": return { ...s, paymentMethod: a.value };
    case "set-card": return { ...s, card: { ...s.card, [a.field]: a.value } };
    case "apply-promo": return { ...s, promoApplied: s.promoCode.trim().length > 0 };
    case "attempt-details": return { ...s, attempted: true, touched: { name: true, email: true, whatsapp: true } };
    case "go": return { ...s, step: a.step };
    case "processing": return { ...s, isProcessing: a.value };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^(\+27|0)\d{8,11}$/;

const validate = (s: CheckoutState) => ({
  name: s.name.trim().length >= 2 ? null : "Please enter your full name.",
  email: EMAIL_RE.test(s.email.trim()) ? null : "Enter a valid email address.",
  whatsapp: WHATSAPP_RE.test(s.whatsapp.replace(/\s/g, "")) ? null : "Use +27… or 0… with 10–13 digits.",
});

/** Deterministic 7×7 mock QR pattern, seeded from the event id. */
const mockQR = (seed: string): boolean[][] => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[][] = [];
  for (let y = 0; y < 7; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < 7; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      row.push(((h >> 16) & 1) === 1);
    }
    cells.push(row);
  }
  return cells;
};

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const event = id ? getEvent(id) : undefined;

  const [s, dispatch] = useReducer(reducer, initialState);

  // Redirect if event missing
  useEffect(() => {
    if (id && !event) navigate("/", { replace: true });
  }, [id, event, navigate]);

  const tier: TicketTier | undefined = useMemo(() => {
    if (!event) return undefined;
    const requested = params.get("ticket");
    const found = event.tickets.find((t) => t.id === requested && t.available);
    if (requested && !found) {
      // friendly fallback, not a crash
      // eslint-disable-next-line no-console
      console.warn(`[checkout] Unknown ticket id "${requested}" — falling back to first available tier.`);
    }
    return found ?? event.tickets.find((t) => t.available) ?? event.tickets[0];
  }, [event, params]);

  const qty = useMemo(() => {
    const raw = Number(params.get("qty") ?? 1);
    if (!Number.isFinite(raw) || raw < 1) return 1;
    return Math.min(10, Math.max(1, Math.floor(raw)));
  }, [params]);

  if (!event || !tier) return <NotFound />;

  const d = formatEventDate(event.date);
  const subtotal = tier.price * qty;
  const discount = s.promoApplied ? Math.round(subtotal * 0.1) : 0;
  const fee = calcBookingFee(qty);
  const total = subtotal - discount + fee;

  const errors = validate(s);
  const showError = (k: "name" | "email" | "whatsapp") => (s.touched[k] || s.attempted) ? errors[k] : null;
  const detailsValid = !errors.name && !errors.email && !errors.whatsapp;

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "attempt-details" });
    if (!detailsValid) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    dispatch({ type: "go", step: "payment" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-show success when returning from PayFast
  useEffect(() => {
    if (params.get("status") === "success") {
      dispatch({ type: "go", step: "success" });
      toast.success("Payment confirmed", { description: "Your ticket is on its way." });
    } else if (params.get("status") === "cancelled") {
      toast.error("Payment cancelled", { description: "You can try again whenever you're ready." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !tier) return;

    if (s.paymentMethod !== "payfast") {
      // Card / EFT not implemented — keep mock flow
      dispatch({ type: "processing", value: true });
      setTimeout(() => {
        dispatch({ type: "processing", value: false });
        dispatch({ type: "go", step: "success" });
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success("Payment confirmed", { description: "Your ticket is on its way to WhatsApp." });
      }, 1800);
      return;
    }

    dispatch({ type: "processing", value: true });
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const origin = window.location.origin;
      const returnUrl = `${origin}/checkout/${event.id}?status=success`;
      const cancelUrl = `${origin}/checkout/${event.id}?status=cancelled`;
      const notifyUrl = `https://${projectId}.supabase.co/functions/v1/payfast-itn`;

      const { data, error } = await supabase.functions.invoke("create-payfast-payment", {
        body: {
          eventId: event.id,
          eventTitle: event.title,
          tierName: tier.name,
          quantity: qty,
          amount: total, // total is already in ZAR rands
          buyer: { name: s.name, email: s.email, whatsapp: s.whatsapp },
          returnUrl,
          cancelUrl,
          notifyUrl,
        },
      });

      if (error || !data?.actionUrl || !data?.fields) {
        throw new Error(error?.message ?? "Could not start PayFast checkout");
      }

      // POST a form to PayFast (avoids URL-encoding mismatches with the signature).
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.actionUrl;
      form.target = "_top";
      for (const [k, v] of Object.entries(data.fields as Record<string, string>)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      dispatch({ type: "processing", value: false });
      toast.error("Couldn't start PayFast", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <div className="container py-10 lg:py-14">
      {s.step !== "success" && (
        <div className="mx-auto mb-8 flex max-w-md items-center justify-between">
          {(["details", "payment"] as const).map((label, i) => {
            const currentIdx = s.step === "details" ? 0 : 1;
            const active = i === currentIdx;
            const done = i < currentIdx;
            return (
              <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-smooth",
                    active && "bg-gradient-sunset text-white shadow-glow",
                    done && "bg-success text-success-foreground",
                    !active && !done && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Icon name="check" className="h-4 w-4" aria-hidden /> : i + 1}
                </div>
                <span className={cn("text-sm font-medium capitalize", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                {i < 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            );
          })}
        </div>
      )}

      {s.step === "success" ? (
        <SuccessPanel event={event} tier={tier} qty={qty} total={total} whatsapp={s.whatsapp || "+27 ••• •••• "} name={s.name || "You"} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="order-2 lg:order-1">
            {s.step === "details" ? (
              <form onSubmit={submitDetails} noValidate className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                <div>
                  <h2 className="font-display text-2xl font-bold">Your details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">We'll send your tickets to your WhatsApp.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={s.name}
                      onChange={(e) => dispatch({ type: "set", field: "name", value: e.target.value })}
                      onBlur={() => dispatch({ type: "blur", field: "name" })}
                      placeholder="Lerato Khumalo"
                      aria-invalid={!!showError("name")}
                      className={cn("mt-1.5 rounded-xl", showError("name") && "border-destructive focus-visible:ring-destructive")}
                    />
                    {showError("name") && <p className="mt-1.5 text-xs text-destructive">{showError("name")}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={s.email}
                      onChange={(e) => dispatch({ type: "set", field: "email", value: e.target.value })}
                      onBlur={() => dispatch({ type: "blur", field: "email" })}
                      placeholder="you@email.com"
                      aria-invalid={!!showError("email")}
                      className={cn("mt-1.5 rounded-xl", showError("email") && "border-destructive focus-visible:ring-destructive")}
                    />
                    {showError("email") && <p className="mt-1.5 text-xs text-destructive">{showError("email")}</p>}
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                      <Icon name="whatsapp" className="h-3.5 w-3.5 text-whatsapp" aria-hidden />
                      Your QR ticket will be sent here
                    </Label>
                    <Input
                      id="whatsapp"
                      value={s.whatsapp}
                      onChange={(e) => dispatch({ type: "set", field: "whatsapp", value: e.target.value })}
                      onBlur={() => dispatch({ type: "blur", field: "whatsapp" })}
                      placeholder="+27 82 123 4567"
                      aria-invalid={!!showError("whatsapp")}
                      className={cn("mt-1.5 rounded-xl focus-visible:ring-whatsapp", showError("whatsapp") && "border-destructive focus-visible:ring-destructive")}
                    />
                    {showError("whatsapp") && <p className="mt-1.5 text-xs text-destructive">{showError("whatsapp")}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="promo">Promo code <span className="text-muted-foreground">(optional)</span></Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      id="promo"
                      value={s.promoCode}
                      onChange={(e) => dispatch({ type: "set", field: "promoCode", value: e.target.value })}
                      placeholder="VAYB10"
                      className="rounded-xl"
                    />
                    <Button type="button" variant="outline" onClick={() => dispatch({ type: "apply-promo" })}>
                      Apply
                    </Button>
                  </div>
                  {s.promoApplied && <p className="mt-1.5 text-xs text-success">Promo applied · 10% off</p>}
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Continue to payment <Icon name="arrow-right" className="h-4 w-4" aria-hidden />
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
                    onClick={() => dispatch({ type: "go", step: "details" })}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    ← Back
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "card" as const, label: "Card", icon: "card" as const, sub: "Visa · Mastercard" },
                    { id: "payfast" as const, label: "PayFast", icon: "sparkles" as const, sub: "Instant EFT" },
                    { id: "eft" as const, label: "EFT", icon: "bank" as const, sub: "Manual transfer" },
                  ].map((m) => {
                    const active = s.paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => dispatch({ type: "set-method", value: m.id })}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-smooth",
                          active ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40",
                        )}
                        aria-pressed={active}
                      >
                        <Icon name={m.icon} className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
                        <p className="mt-2 font-display font-semibold">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.sub}</p>
                      </button>
                    );
                  })}
                </div>

                {s.paymentMethod === "card" && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-5">
                    <div>
                      <Label htmlFor="cc">Card number</Label>
                      <Input
                        id="cc"
                        inputMode="numeric"
                        maxLength={19}
                        value={s.card.number}
                        onChange={(e) => dispatch({ type: "set-card", field: "number", value: e.target.value.replace(/[^\d ]/g, "") })}
                        placeholder="4242 4242 4242 4242"
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exp">Expiry</Label>
                        <Input
                          id="exp"
                          maxLength={5}
                          value={s.card.expiry}
                          onChange={(e) => dispatch({ type: "set-card", field: "expiry", value: e.target.value })}
                          placeholder="MM/YY"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVV</Label>
                        <Input
                          id="cvc"
                          maxLength={3}
                          inputMode="numeric"
                          value={s.card.cvc}
                          onChange={(e) => dispatch({ type: "set-card", field: "cvc", value: e.target.value.replace(/\D/g, "") })}
                          placeholder="123"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {s.paymentMethod === "payfast" && (
                  <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                    You'll be redirected to PayFast to complete an instant EFT.
                  </div>
                )}
                {s.paymentMethod === "eft" && (
                  <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                    We'll email you our banking details. Tickets release once payment clears (usually 1 business day).
                  </div>
                )}

                <Button type="submit" variant="hero" size="xl" className="w-full" disabled={s.isProcessing}>
                  {s.isProcessing ? "Processing…" : `Pay ${formatZAR(total)}`}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="shield-check" className="h-3 w-3" aria-hidden /> 256-bit encrypted · No card details stored
                </p>
              </form>
            )}
          </div>

          <OrderSummary event={event} tier={tier} qty={qty} subtotal={subtotal} discount={discount} fee={fee} total={total} />
        </div>
      )}
    </div>
  );
};

const OrderSummary = ({
  event, tier, qty, subtotal, discount, fee, total,
}: { event: Event; tier: TicketTier; qty: number; subtotal: number; discount: number; fee: number; total: number }) => {
  const d = formatEventDate(event.date);
  return (
    <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-pop">
        <div className="relative h-32 w-full overflow-hidden">
          <img src={event.image} alt={`${event.title} order summary`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Your order</p>
            <p className="line-clamp-1 font-display text-base font-bold">{event.title}</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground"><Icon name="calendar" className="h-3.5 w-3.5" aria-hidden /> {d.full} · {d.time}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Icon name="map-pin" className="h-3.5 w-3.5" aria-hidden /> {event.venue}, {event.city}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Icon name="ticket" className="h-4 w-4 text-primary" aria-hidden /> {qty} × {tier.name}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {tier.perks.map((p) => <li key={p}>· {p}</li>)}
            </ul>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-success"><span>Promo</span><span>−{formatZAR(discount)}</span></div>
            )}
            <div className="flex justify-between text-muted-foreground"><span>Booking fee ({formatZAR(BUYER_BOOKING_FEE_PER_TICKET)} × {qty})</span><span>{formatZAR(fee)}</span></div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display text-2xl font-bold text-gradient-sunset">{formatZAR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SuccessPanel = ({
  event, tier, qty, total, whatsapp, name,
}: { event: Event; tier: TicketTier; qty: number; total: number; whatsapp: string; name: string }) => {
  const d = formatEventDate(event.date);
  const cells = useMemo(() => mockQR(event.id), [event.id]);
  return (
    <div className="mx-auto max-w-2xl animate-fade-up text-center">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-sunset shadow-glow">
        <Icon name="check" className="h-9 w-9 text-white" aria-hidden />
        <span className="absolute inset-0 animate-pulse-glow rounded-full bg-gradient-sunset opacity-50 blur-xl" aria-hidden />
      </div>
      <h1 className="mt-6 inline-flex items-center justify-center gap-3 font-display text-4xl font-bold sm:text-5xl">
        You're in! <Icon name="gift" className="h-9 w-9 text-primary" aria-hidden />
      </h1>
      <p className="mt-3 text-muted-foreground">
        We've sent your QR ticket to WhatsApp <span className="font-semibold text-foreground">{whatsapp}</span>.
      </p>

      <div className="mx-auto mt-8 overflow-hidden rounded-3xl border border-border bg-gradient-card text-left shadow-pop">
        <div className="bg-gradient-sunset p-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-90">Vayb ticket</p>
          <p className="font-display text-xl font-bold">{event.title}</p>
          <p className="text-sm opacity-90">{d.full} · {d.time}</p>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[140px_1fr] sm:items-center">
          <div
            className="mx-auto grid h-32 w-32 gap-[2px] rounded-2xl border border-border bg-background p-2"
            style={{ gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(7, 1fr)" }}
            role="img"
            aria-label="Mock QR code"
          >
            {cells.flat().map((on, i) => (
              <span key={i} className={cn("rounded-[1px]", on ? "bg-foreground" : "bg-transparent")} />
            ))}
          </div>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Holder:</span> <span className="font-semibold">{name}</span></p>
            <p><span className="text-muted-foreground">Tier:</span> <span className="font-semibold">{qty} × {tier.name}</span></p>
            <p><span className="text-muted-foreground">Venue:</span> <span className="font-semibold">{event.venue}, {event.city}</span></p>
            <p><span className="text-muted-foreground">Total paid:</span> <span className="font-semibold text-gradient-sunset">{formatZAR(total)}</span></p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline" size="lg">
          <Link to="/tickets">View my tickets</Link>
        </Button>
        <Button asChild variant="hero" size="lg">
          <Link to="/">Browse more events <Icon name="arrow-right" className="h-4 w-4" aria-hidden /></Link>
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
