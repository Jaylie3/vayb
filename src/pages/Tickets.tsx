import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { formatZAR } from "@/lib/events";

type TicketRow = {
  id: string;
  event_title: string;
  tier_name: string;
  quantity: number;
  total: number;
  status: string;
  qr_code: string;
  created_at: string;
};

const qrCells = (seed: string): boolean[][] => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: 7 }, () =>
    Array.from({ length: 7 }, () => {
      h = (h * 1103515245 + 12345) >>> 0;
      return ((h >> 16) & 1) === 1;
    }),
  );
};

const Tickets = () => {
  const { user, loading } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    (async () => {
      const ticketsClient = supabase as unknown as {
        from: (table: "tickets") => {
          select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => Promise<{ data: TicketRow[] | null; error: unknown }> };
        };
      };
      const { data, error } = await ticketsClient
        .from("tickets")
        .select("id,event_title,tier_name,quantity,total,status,qr_code,created_at")
        .order("created_at", { ascending: false });
      if (!error && data) setTickets(data);
      setFetching(false);
    })();
  }, [user]);

  if (loading) return <div className="container py-16 text-center text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-3xl font-bold">My Tickets</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view your tickets and order history.</p>
        <Button asChild variant="hero" size="lg" className="mt-6">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-bold">My Tickets</h1>
      <p className="mt-1 text-muted-foreground">Your purchases and ticket history.</p>

      {fetching ? (
        <p className="mt-10 text-center text-muted-foreground">Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
          <Icon name="ticket" className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="mt-4 font-display text-lg font-semibold">No tickets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Paid tickets will appear here after PayFast confirms payment.</p>
          <Button asChild variant="hero" size="lg" className="mt-6">
            <Link to="/">Browse events</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">{ticket.event_title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.quantity} × {ticket.tier_name}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
                <div className="grid h-20 w-20 shrink-0 gap-[1px] rounded-xl border border-border bg-background p-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(7, 1fr)" }} aria-label="QR ticket">
                  {qrCells(ticket.qr_code).flat().map((on, i) => (
                    <span key={i} className={on ? "rounded-[1px] bg-foreground" : "rounded-[1px] bg-transparent"} />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{ticket.status}</p>
                <p className="font-display font-bold text-gradient-sunset">{formatZAR(ticket.total)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tickets;
