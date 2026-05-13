import { Logo } from "./Logo";
import { Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-muted/40">
    <div className="container grid gap-10 py-16 md:grid-cols-4">
      <div className="space-y-4">
        <Logo />
        <p className="max-w-xs text-sm text-muted-foreground">
          South Africa's mobile-first ticketing platform. Tickets to WhatsApp, lower fees, same-day payouts.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/vayb"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-smooth hover:border-primary hover:text-primary"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://facebook.com/vayb"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-smooth hover:border-primary hover:text-primary"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="https://x.com/vayb"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-smooth hover:border-primary hover:text-primary"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </div>

      {[
        { title: "Discover", links: ["Trending", "Music", "Festivals", "Sports", "Comedy", "Markets"] },
        { title: "Organisers", links: ["List your event", "Pricing", "Same-day payouts", "WhatsApp delivery", "Scan-in app"] },
        { title: "Support", links: ["Help centre", "Contact", "Refund policy", "Terms", "Privacy"] },
      ].map((col) => (
        <div key={col.title}>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">{col.title}</h4>
          <ul className="space-y-2.5">
            {col.links.map((l) => (
              <li key={l}>
                <a href="#" className="text-sm text-muted-foreground transition-smooth hover:text-foreground">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Vayb. All rights reserved.</p>
        
      </div>
    </div>
  </footer>
);
