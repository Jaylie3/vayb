import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatZAR, calcBookingFee, BUYER_BOOKING_FEE_PER_TICKET } from "@/lib/events";
import type { TicketTier } from "@/types/events";

export type TicketSelectorProps = {
  tiers: TicketTier[];
  selectedTierId: string;
  quantity: number;
  onTierChange: (id: string) => void;
  onQuantityChange: (n: number) => void;
  onProceed: () => void;
  /** Compact layout for the mobile bottom-bar drawer. */
  compact?: boolean;
};

export const TicketSelector = ({
  tiers,
  selectedTierId,
  quantity,
  onTierChange,
  onQuantityChange,
  onProceed,
  compact = false,
}: TicketSelectorProps) => {
  const tier = tiers.find((t) => t.id === selectedTierId) ?? tiers[0];
  const subtotal = tier.price * quantity;
  const fee = Math.round(subtotal * BUYER_FEE_RATE);
  const total = subtotal + fee;

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {!compact && (
        <div className="flex items-center gap-2">
          <Icon name="ticket" className="h-4 w-4 text-primary" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Choose your ticket</p>
        </div>
      )}

      <div className="space-y-2.5" role="radiogroup" aria-label="Ticket tiers">
        {tiers.map((t) => {
          const active = t.id === tier.id;
          const disabled = !t.available;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && onTierChange(t.id)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-smooth",
                active && !disabled && "border-primary bg-primary/5 shadow-glow ring-1 ring-primary",
                !active && !disabled && "border-border hover:border-primary/40 hover:bg-muted/40",
                disabled && "cursor-not-allowed border-border bg-muted/30 opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-semibold">{t.name}</p>
                    {t.badge && t.available && (
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {t.badge}
                      </span>
                    )}
                    {disabled && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sold out
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

      <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
          >
            <Icon name="minus" className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <span className="w-6 text-center font-display text-base font-semibold" aria-live="polite">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
            aria-label="Increase quantity"
            disabled={quantity >= 10}
          >
            <Icon name="plus" className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{quantity} × {tier.name}</span>
          <span>{formatZAR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Booking fee (3%)</span>
          <span>{formatZAR(fee)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-display font-semibold">Total</span>
          <span className="font-display text-xl font-bold text-gradient-sunset">{formatZAR(total)}</span>
        </div>
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={onProceed} disabled={!tier.available}>
        Get tickets · {formatZAR(total)}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Icon name="shield" className="h-3 w-3" aria-hidden /> Secure checkout · PayFast, card &amp; EFT
      </p>
    </div>
  );
};
