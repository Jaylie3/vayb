import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Discover</Link>
          <a href="#categories" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Categories</a>
          <a href="#organisers" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">For organisers</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="hero" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border/60 bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">Discover</Link>
            <a href="#categories" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">Categories</a>
            <a href="#organisers" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">For organisers</a>
            <Button variant="hero" className="mt-2">Sign in</Button>
          </div>
        </nav>
      )}
    </header>
  );
};
