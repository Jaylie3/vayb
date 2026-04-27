import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { useChrome } from "@/layouts/ChromeContext";
import { toast } from "sonner";

/** Global app header. Visual mode is derived from {@link useChrome}:
 *  while a hero is in view → transparent on dark; otherwise → solid + bordered. */
export const Header = () => {
  const [open, setOpen] = useState(false);
  const { transparent } = useChrome();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = () => {
    setOpen(false);
    toast.info("Sign in is coming soon", {
      description: "Accounts launch alongside saved events and ticket history.",
    });
  };

  const handleGetTickets = () => {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/#featured");
    }
  };

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
          <Button onClick={handleSignIn} variant={transparent ? "glass" : "ghost"} size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button onClick={handleGetTickets} variant="hero" size="sm" className="hidden sm:inline-flex">
            Get tickets
          </Button>
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
            <button onClick={handleSignIn} className="rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-muted">Sign in</button>
            <Button onClick={handleGetTickets} variant="hero" className="mt-2 w-full">Get tickets</Button>
          </div>
        </nav>
      )}
    </header>
  );
};
