import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatZAR } from "@/lib/events";
import { toast } from "sonner";

type CityRow = {
  city: string;
  bookings: number;
  tickets_sold: number;
  revenue: number;
  commission: number;
  payout: number;
};

const AdminAnalytics = () => {
  const { user, loading } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const navigate = useNavigate();
  const [rows, setRows] = useState<CityRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/admin/analytics", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    setBusy(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("admin_city_analytics").then(({ data, error }: { data: CityRow[] | null; error: { message: string } | null }) => {
      if (error) {
        toast.error("Could not load analytics", { description: error.message });
      } else {
        setRows((data ?? []).map((r) => ({
          ...r,
          bookings: Number(r.bookings),
          tickets_sold: Number(r.tickets_sold),
          revenue: Number(r.revenue),
          commission: Number(r.commission),
          payout: Number(r.payout),
        })));
      }
      setBusy(false);
    });
  }, [isAdmin]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          bookings: acc.bookings + r.bookings,
          tickets: acc.tickets + r.tickets_sold,
          revenue: acc.revenue + r.revenue,
          commission: acc.commission + r.commission,
          payout: acc.payout + r.payout,
        }),
        { bookings: 0, tickets: 0, revenue: 0, commission: 0, payout: 0 },
      ),
    [rows],
  );

  const maxRevenue = useMemo(() => Math.max(1, ...rows.map((r) => r.revenue)), [rows]);
  const activeRows = rows.filter((r) => r.bookings > 0);

  if (loading || checking) {
    return <div className="container py-24 text-center text-muted-foreground">Checking access…</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="container max-w-lg py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Admins only</h1>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/">Back to discover</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 lg:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin</p>
          <h1 className="font-display text-3xl font-bold lg:text-4xl">Analytics by city</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paid bookings, gross revenue and organiser payouts (after 3% platform commission).
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin"><Icon name="arrow-left" className="mr-1 h-4 w-4" /> Dashboard</Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bookings" value={totals.bookings.toLocaleString()} hint={`${totals.tickets.toLocaleString()} tickets`} />
        <StatCard label="Gross revenue" value={formatZAR(totals.revenue)} />
        <StatCard label="Platform commission" value={formatZAR(totals.commission)} hint="3% of revenue" />
        <StatCard label="Organiser payouts" value={formatZAR(totals.payout)} />
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-8">
        <h2 className="font-display text-xl font-bold">By city</h2>
        {busy ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : activeRows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No paid bookings yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">City</th>
                  <th className="pb-3 text-right font-medium">Bookings</th>
                  <th className="pb-3 text-right font-medium">Tickets</th>
                  <th className="pb-3 text-right font-medium">Revenue</th>
                  <th className="pb-3 text-right font-medium">Commission</th>
                  <th className="pb-3 text-right font-medium">Payout</th>
                </tr>
              </thead>
              <tbody>
                {activeRows.map((r) => (
                  <tr key={r.city} className="border-t border-border">
                    <td className="py-3">
                      <div className="font-medium">{r.city}</div>
                      <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.max(4, (r.revenue / maxRevenue) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums">{r.bookings.toLocaleString()}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{r.tickets_sold.toLocaleString()}</td>
                    <td className="py-3 text-right font-medium tabular-nums">{formatZAR(r.revenue)}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{formatZAR(r.commission)}</td>
                    <td className="py-3 text-right font-medium tabular-nums">{formatZAR(r.payout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default AdminAnalytics;
