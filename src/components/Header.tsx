import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { useChrome } from "@/layouts/ChromeContext";
import { useAuth } from "@/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const initials = (s: string) => {
  const parts = s.trim().split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "V";
};

/** Global app header. Visual mode is derived from {@link useChrome}:
 *  while a hero is in view → transparent on dark; otherwise → solid + bordered. */
export const Header = () => {
  const [open, setOpen] = useState(false);
  const { transparent } = useChrome();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const goAuth = (mode: "signin" | "signup") => {
    setOpen(false);
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    navigate(`/auth?mode=${mode}&next=${next}`);
  };

  const handleGetTickets = () => {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/#featured");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "";

  return (
    <header
      data-transparent={transparent}
      className={cn(
        "sticky top-0 z-50 transition-smooth",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-background/85 backdrop-blur-xl",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className={cn(transparent && "text-white")}>
          <Logo />
        </div>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {[
            { to: "/", label: "Discover" },
            { to: "/#categories", label: "Categories" },
            { to: "/#organisers", label: "For organisers" },
          ].map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={cn(
                "text-sm font-medium transition-smooth",
                transparent ? "text-white/85 hover:text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full pl-1 pr-3 text-sm font-medium transition-smooth",
                    transparent
                      ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                      : "border border-border bg-card hover:bg-muted",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-sunset text-[11px] font-bold text-white shadow-glow">
                    {initials(displayName)}
                  </span>
                  <span className="hidden max-w-[140px] truncate sm:inline">{displayName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleGetTickets}>
                  <Icon name="ticket" className="mr-2 h-4 w-4" aria-hidden /> Browse events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("My tickets coming soon")}>
                  <Icon name="clipboard" className="mr-2 h-4 w-4" aria-hidden /> My tickets
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <Icon name="arrow-left" className="mr-2 h-4 w-4" aria-hidden /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={() => goAuth("signin")} variant={transparent ? "glass" : "ghost"} size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
              <Button onClick={handleGetTickets} variant="hero" size="sm" className="hidden sm:inline-flex">
                Get tickets
              </Button>
            </>
          )}
          <Button
            variant={transparent ? "glass" : "ghost"}
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <Icon name={open ? "close" : "menu"} className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border/60 bg-background md:hidden" aria-label="Mobile">
          <div className="container flex flex-col gap-1 py-3">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">Discover</Link>
            <a href="/#categories" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">Categories</a>
            <a href="/#organisers" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">For organisers</a>
            {user ? (
              <>
                <button onClick={() => toast.info("My tickets coming soon")} className="rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-muted">
                  My tickets
                </button>
                <button onClick={handleSignOut} className="rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-muted">
                  Sign out
                </button>
              </>
            ) : (
              <button onClick={() => goAuth("signin")} className="rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-muted">
                Sign in
              </button>
            )}
            <Button onClick={handleGetTickets} variant="hero" className="mt-2 w-full">Get tickets</Button>
          </div>
        </nav>
      )}
    </header>
  );
};
