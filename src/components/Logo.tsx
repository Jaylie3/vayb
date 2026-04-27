import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Vayb home">
    <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-sunset shadow-glow transition-bounce group-hover:scale-105">
      <span className="font-display text-lg font-bold text-white">V</span>
      <span className="absolute inset-0 rounded-2xl bg-glow opacity-60 blur-md" aria-hidden />
    </span>
    <span className="font-display text-xl font-bold tracking-tight">vayb</span>
  </Link>
);
