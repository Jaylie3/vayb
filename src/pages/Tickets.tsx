import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { formatZAR } from "@/lib/events";

type OrderRow = {
  id: string;
  event_id: string;
  total: number;
  status: string;
  created_at: string;
};

const Tickets = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, event_id, total, status, created_at")
        .order("created_at", { ascending: false });
      if (!error && data) setOrders(data as OrderRow[]);
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
        <p className="mt-10 text-center text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
          <Icon name="ticket" className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="mt-4 font-display text-lg font-semibold">No tickets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Find your next vibe and grab a ticket.</p>
          <Button asChild variant="hero" size="lg" className="mt-6">
            <Link to="/">Browse events</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="font-display font-semibold">Order #{o.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-gradient-sunset">{formatZAR(o.total)}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{o.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tickets;
