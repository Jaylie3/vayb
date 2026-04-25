import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 font-display font-bold ${className}`}>
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-sunset shadow-glow">
      <Ticket className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
    </span>
    <span className="text-xl tracking-tight">Vayb</span>
  </Link>
);
