import { Logo } from "./Logo";
import { Instagram, Twitter, Facebook } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-muted/30">
    <div className="container grid gap-10 py-14 md:grid-cols-4">
      <div className="space-y-4">
        <Logo />
        <p className="max-w-xs text-sm text-muted-foreground">
          South Africa's mobile-first ticketing platform. Lower fees, WhatsApp delivery, same-day payouts.
        </p>
        <div className="flex gap-3">
          {[Instagram, Twitter, Facebook].map((Icon, i) => (
            <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-background transition-smooth hover:bg-primary hover:text-primary-foreground" aria-label="Social">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      {[
        { title: "Discover", links: ["All events", "This weekend", "Free events", "Cape Town", "Johannesburg"] },
        { title: "Organisers", links: ["Sell tickets", "Pricing", "Same-day payouts", "Marketing tools", "WhatsApp delivery"] },
        { title: "Company", links: ["About", "Careers", "Press", "Help centre", "Contact"] },
      ].map((col) => (
        <div key={col.title}>
          <h4 className="mb-3 font-display text-sm font-semibold">{col.title}</h4>
          <ul className="space-y-2">
            {col.links.map((l) => (
              <li key={l}><a href="#" className="text-sm text-muted-foreground transition-smooth hover:text-foreground">{l}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Vayb. Made in South Africa.</p>
        <p>Tickets that arrive on WhatsApp. Payouts that arrive today.</p>
      </div>
    </div>
  </footer>
);
