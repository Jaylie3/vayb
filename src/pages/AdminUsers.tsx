import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/Icon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

type AppRole = "user" | "organiser" | "admin";

type UserRow = {
  user_id: string;
  email: string | null;
  created_at: string;
  roles: AppRole[];
};

const ROLE_OPTIONS: AppRole[] = ["admin", "organiser"];

const AdminUsers = () => {
  const { user, loading } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/admin/users", { replace: true });
  }, [user, loading, navigate]);

  const load = useCallback(async () => {
    setReloading(true);
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      toast.error("Could not load users", { description: error.message });
    } else {
      setRows((data ?? []) as UserRow[]);
    }
    setReloading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const toggle = async (target: UserRow, role: AppRole, grant: boolean) => {
    const key = `${target.user_id}:${role}`;
    setBusyKey(key);
    const { error } = await supabase.rpc("admin_set_role", {
      _target: target.user_id,
      _role: role,
      _grant: grant,
    });
    setBusyKey(null);
    if (error) {
      toast.error(grant ? "Could not grant role" : "Could not revoke role", {
        description: error.message,
      });
      return;
    }
    toast.success(`${grant ? "Granted" : "Revoked"} ${role} for ${target.email ?? "user"}`);
    setRows((prev) =>
      prev.map((r) =>
        r.user_id !== target.user_id
          ? r
          : {
              ...r,
              roles: grant
                ? Array.from(new Set([...r.roles, role]))
                : r.roles.filter((x) => x !== role),
            },
      ),
    );
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
          Your account doesn't have admin access.
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
          <h1 className="font-display text-3xl font-bold lg:text-4xl">User roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Grant or revoke admin and organiser access. Changes apply immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <Icon name="arrow-left" className="mr-1 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={reloading}>
            {reloading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_auto_auto] gap-4 border-b border-border bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>User</div>
          <div>Joined</div>
          <div className="text-center">Admin</div>
          <div className="text-center">Organiser</div>
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            {reloading ? "Loading…" : "No users yet."}
          </div>
        )}

        <ul className="divide-y divide-border">
          {rows.map((u) => {
            const isSelf = u.user_id === user.id;
            return (
              <li
                key={u.user_id}
                className="grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-4 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {u.email ?? "—"} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{u.user_id}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </div>
                {ROLE_OPTIONS.map((role) => {
                  const has = u.roles.includes(role);
                  const key = `${u.user_id}:${role}`;
                  const disabled =
                    busyKey === key || (role === "admin" && isSelf && has);
                  return (
                    <div key={role} className="flex justify-center">
                      <Switch
                        checked={has}
                        disabled={disabled}
                        onCheckedChange={(v) => toggle(u, role, v)}
                        aria-label={`${has ? "Revoke" : "Grant"} ${role} for ${u.email}`}
                      />
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        You can't revoke your own admin role to prevent lockout.
      </p>
    </div>
  );
};

export default AdminUsers;
