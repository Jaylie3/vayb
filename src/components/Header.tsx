import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Header = ({ overlay = false }: { overlay?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isTransparent = overlay && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-smooth",
        isTransparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-background/85 backdrop-blur-xl",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className={cn(isTransparent && "text-white")}>
          <Logo />
        </div>
        <nav className="hidden items-center gap-8 md:flex">
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
                isTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant={isTransparent ? "glass" : "ghost"}
            size="sm"
            className="hidden sm:inline-flex"
          >
            Sign in
          </Button>
          <Button variant="hero" size="sm" className="hidden sm:inline-flex">
            Get tickets
          </Button>
          <Button
            variant={isTransparent ? "glass" : "ghost"}
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border/60 bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            <Link to="/" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">Discover</Link>
            <a href="#categories" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">Categories</a>
            <a href="#organisers" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">For organisers</a>
            <Button variant="hero" className="mt-2 w-full">Get tickets</Button>
          </div>
        </nav>
      )}
    </header>
  );
};
