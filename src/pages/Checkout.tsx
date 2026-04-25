import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEvent, formatZAR, formatEventDate } from "@/data/events";
import { toast } from "@/hooks/use-toast";

const Checkout = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const event = id ? getEvent(id) : undefined;
  const [done, setDone] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

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

  const ticketId = params.get("ticket") ?? event.tickets[0].id;
  const qty = Number(params.get("qty") ?? 1);
  const ticket = event.tickets.find((t) => t.id === ticketId) ?? event.tickets[0];
  const subtotal = ticket.price * qty;
  const fee = Math.round(subtotal * 0.03);
  const total = subtotal + fee;
  const d = formatEventDate(event.date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp.trim()) {
      toast({ title: "WhatsApp number required", description: "We send your tickets there." });
      return;
    }
    setDone(true);
    toast({ title: "Tickets confirmed 🎉", description: "Check your WhatsApp in a few seconds." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to event
        </button>

        {done ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-gradient-card p-8 text-center shadow-pop">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-sunset shadow-glow">
              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold">You're going!</h1>
            <p className="mt-2 text-muted-foreground">
              {qty} × {ticket.name} for {event.title}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-whatsapp/10 p-4">
              <MessageCircle className="h-5 w-5 text-whatsapp" />
              <span className="text-sm">Tickets sent to <span className="font-semibold">{whatsapp}</span></span>
            </div>
            <Button variant="hero" size="lg" className="mt-6" onClick={() => navigate("/")}>Discover more events</Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h1 className="font-display text-3xl font-bold">Checkout</h1>
                <p className="mt-1 text-sm text-muted-foreground">Almost there. Tickets arrive on WhatsApp instantly.</p>
              </div>

              <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
                <h2 className="font-display text-lg font-semibold">Your details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" required placeholder="Thandi" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" required placeholder="Mokoena" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="you@example.co.za" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-whatsapp" /> WhatsApp number
                    </Label>
                    <Input id="whatsapp" type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+27 82 123 4567" />
                    <p className="text-xs text-muted-foreground">Your QR ticket and event reminders are sent here.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
                <h2 className="font-display text-lg font-semibold">Payment</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["Card", "PayFast", "Instant EFT"].map((m, i) => (
                    <label key={m} className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-border bg-background p-3 transition-smooth has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <input type="radio" name="method" defaultChecked={i === 0} className="accent-primary" />
                      <span className="text-sm font-medium">{m}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="card">Card number</Label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="card" inputMode="numeric" placeholder="4242 4242 4242 4242" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp">Expiry</Label>
                    <Input id="exp" placeholder="MM / YY" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </section>

              <Button type="submit" variant="hero" size="xl" className="w-full">
                Pay {formatZAR(total)} · Get tickets
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secured by Vayb · PCI-DSS encryption
              </p>
            </form>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-pop">
                <img src={event.image} alt={event.title} className="h-40 w-full object-cover" />
                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="font-display font-bold leading-tight">{event.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{d.full} · {event.venue}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
                    <span>{qty} × {ticket.name}</span>
                    <span className="font-semibold">{formatZAR(subtotal)}</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Booking fee (3%)</span><span>{formatZAR(fee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
                      <span>Total</span><span className="text-gradient-sunset">{formatZAR(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
