import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/Icon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import { formatZAR } from "@/lib/events";
import { SA_CITIES } from "@/types/events";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  city: string;
  venue: string;
  date: string;
  price_from: number;
  trending: boolean;
};

type TierDraft = {
  name: string;
  price: string;
  perks: string;
  badge: string;
  available: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const blankTier = (): TierDraft => ({ name: "", price: "", perks: "", badge: "", available: true });

const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const Admin = () => {
  const { user, loading } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("music");
  const [city, setCity] = useState("Cape Town");
  const [venue, setVenue] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [date, setDate] = useState("");
  const [doorsTime, setDoorsTime] = useState("");
  const [image, setImage] = useState("");
  const [organiser, setOrganiser] = useState("");
  const [organiserVerified, setOrganiserVerified] = useState(false);
  const [trending, setTrending] = useState(false);
  const [description, setDescription] = useState("");
  const [tiers, setTiers] = useState<TierDraft[]>([blankTier()]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/admin", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("events")
      .select("id,title,slug,city,venue,date,price_from,trending")
      .order("date", { ascending: false })
      .then(({ data }) => setEvents((data as EventRow[]) ?? []));
  }, [isAdmin, refreshKey]);

  const computedSlug = useMemo(
    () => (slugTouched || editingId ? slug : slugify(title)),
    [title, slug, slugTouched, editingId],
  );

  const updateTier = (i: number, patch: Partial<TierDraft>) =>
    setTiers((t) => t.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const removeTier = (i: number) => setTiers((t) => t.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setSlug(""); setSlugTouched(false); setSubtitle("");
    setCategory("music"); setCity("Cape Town");
    setVenue(""); setVenueAddress(""); setDate(""); setDoorsTime("");
    setImage(""); setOrganiser(""); setOrganiserVerified(false); setTrending(false);
    setDescription(""); setTiers([blankTier()]);
  };

  const startEdit = async (id: string) => {
    const { data, error } = await supabase
      .from("events")
      .select("*, ticket_tiers(name,price,perks,badge,available,sort_order)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast.error("Could not load event", { description: error?.message });
      return;
    }
    setEditingId(id);
    setTitle(data.title);
    setSlug(data.slug);
    setSlugTouched(true);
    setSubtitle(data.subtitle ?? "");
    setCategory(data.category);
    setCity(data.city);
    setVenue(data.venue);
    setVenueAddress(data.venue_address ?? "");
    setDate(toLocalInput(data.date));
    setDoorsTime(toLocalInput(data.doors_time));
    setImage(data.image);
    setOrganiser(data.organiser);
    setOrganiserVerified(data.organiser_verified);
    setTrending(data.trending);
    setDescription(data.description ?? "");
    const ts = ([...(data.ticket_tiers ?? [])] as Array<{
      name: string; price: number; perks: string[] | null; badge: string | null; available: boolean; sort_order: number;
    }>).sort((a, b) => a.sort_order - b.sort_order);
    setTiers(
      ts.length === 0
        ? [blankTier()]
        : ts.map((t) => ({
            name: t.name,
            price: String(t.price),
            perks: (t.perks ?? []).join(", "),
            badge: t.badge ?? "",
            available: t.available,
          })),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalSlug = computedSlug || slugify(title);
    const validTiers = tiers
      .map((t) => ({ ...t, name: t.name.trim(), priceNum: Number(t.price) }))
      .filter((t) => t.name && Number.isFinite(t.priceNum) && t.priceNum >= 0);

    if (!title || !finalSlug || !venue || !date || !image || !organiser) {
      toast.error("Fill in title, slug, venue, date, image URL and organiser.");
      return;
    }
    if (validTiers.length === 0) {
      toast.error("Add at least one ticket tier with a name and price.");
      return;
    }

    setBusy(true);
    try {
      const priceFrom = Math.min(...validTiers.map((t) => t.priceNum));
      const payload = {
        slug: finalSlug,
        title,
        subtitle: subtitle || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: category as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        city: city as any,
        venue,
        venue_address: venueAddress || null,
        date: new Date(date).toISOString(),
        doors_time: doorsTime ? new Date(doorsTime).toISOString() : null,
        image,
        organiser,
        organiser_verified: organiserVerified,
        trending,
        description,
        price_from: priceFrom,
      };

      let eventId = editingId;
      if (editingId) {
        const { error: upErr } = await supabase.from("events").update(payload).eq("id", editingId);
        if (upErr) throw upErr;
        // Replace tiers
        await supabase.from("ticket_tiers").delete().eq("event_id", editingId);
      } else {
        const { data: ev, error: evErr } = await supabase
          .from("events")
          .insert({ ...payload, owner_id: user.id })
          .select("id")
          .single();
        if (evErr) throw evErr;
        eventId = ev.id;
      }

      const { error: tierErr } = await supabase.from("ticket_tiers").insert(
        validTiers.map((t, idx) => ({
          event_id: eventId!,
          name: t.name,
          price: t.priceNum,
          perks: t.perks ? t.perks.split(",").map((p) => p.trim()).filter(Boolean) : [],
          badge: t.badge || null,
          available: t.available,
          sort_order: idx,
        })),
      );
      if (tierErr) throw tierErr;

      toast.success(editingId ? "Event updated" : "Event published");
      resetForm();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save event";
      toast.error("Save failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const removeEvent = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    await supabase.from("ticket_tiers").delete().eq("event_id", id);
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete", { description: error.message });
      return;
    }
    toast.success("Event deleted");
    if (editingId === id) resetForm();
    setRefreshKey((k) => k + 1);
  };

  if (loading || checking) {
    return <div className="container py-24 text-center text-muted-foreground">Checking access…</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="container max-w-lg py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Admins only</h1>
        <p className="mt-3 text-muted-foreground">
          Your account doesn't have admin access. Ask the site owner to grant you the admin role.
        </p>
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
          <h1 className="font-display text-3xl font-bold lg:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit and remove events — changes go live immediately.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/analytics">
              <Icon name="flash" className="mr-1 h-4 w-4" /> Analytics
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/users">
              <Icon name="shield" className="mr-1 h-4 w-4" /> Manage admins
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Create / Edit */}
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">
              {editingId ? "Edit event" : "New event"}
            </h2>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug" value={computedSlug}
                  onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                  placeholder="auto-from-title" required
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["music","festivals","sports","comedy","food","conferences"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SA_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="venueAddress">Venue address (optional)</Label>
              <Input id="venueAddress" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="date">Start date & time</Label>
                <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doors">Doors open (optional)</Label>
                <Input id="doors" type="datetime-local" value={doorsTime} onChange={(e) => setDoorsTime(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Cover image URL</Label>
              <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="organiser">Organiser</Label>
                <Input id="organiser" value={organiser} onChange={(e) => setOrganiser(e.target.value)} required />
              </div>
              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={organiserVerified} onCheckedChange={setOrganiserVerified} />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={trending} onCheckedChange={setTrending} />
                  Trending
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Tiers */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Ticket tiers</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setTiers((t) => [...t, blankTier()])}>
                <Icon name="plus" className="mr-1 h-4 w-4" /> Add tier
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {tiers.map((t, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background p-4">
                  <div className="grid gap-3 sm:grid-cols-[1.2fr_0.6fr_0.8fr]">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input value={t.name} onChange={(e) => updateTier(i, { name: e.target.value })} placeholder="Early Bird" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Price (ZAR)</Label>
                      <Input type="number" min="0" value={t.price} onChange={(e) => updateTier(i, { price: e.target.value })} placeholder="450" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Badge (optional)</Label>
                      <Input value={t.badge} onChange={(e) => updateTier(i, { badge: e.target.value })} placeholder="Selling fast" />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    <Label className="text-xs">Perks (comma-separated)</Label>
                    <Input value={t.perks} onChange={(e) => updateTier(i, { perks: e.target.value })} placeholder="Standing access, WhatsApp ticket" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={t.available} onCheckedChange={(v) => updateTier(i, { available: v })} />
                      Available for sale
                    </label>
                    {tiers.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTier(i)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={busy} className="mt-8 w-full">
            {busy ? (editingId ? "Saving…" : "Publishing…") : editingId ? "Save changes" : "Publish event"}
          </Button>
        </form>

        {/* List */}
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-8">
          <h2 className="font-display text-xl font-bold">Your events</h2>
          <p className="mt-1 text-sm text-muted-foreground">{events.length} live event{events.length === 1 ? "" : "s"}</p>

          <ul className="mt-5 space-y-3">
            {events.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No events yet. Publish your first one.
              </li>
            )}
            {events.map((ev) => {
              const isEditing = editingId === ev.id;
              return (
                <li
                  key={ev.id}
                  className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${
                    isEditing ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="min-w-0">
                    <Link to={`/events/${ev.slug}`} className="font-semibold hover:underline">{ev.title}</Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(ev.date).toLocaleString()} · {ev.city} · {ev.venue}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">From {formatZAR(ev.price_from)}{ev.trending ? " · Trending" : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(ev.id)}
                      aria-label="Edit event"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvent(ev.id)}
                      aria-label="Delete event"
                      title="Delete"
                    >
                      <Icon name="close" className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Admin;
