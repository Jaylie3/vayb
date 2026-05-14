import { Link } from "react-router-dom";
import logo from "@/assets/vayb-logo.png";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`group inline-flex items-center ${className}`} aria-label="Vayb home">
    <img
      src={logo}
      alt="Vayb"
      className="h-9 w-auto transition-bounce group-hover:scale-105"
    />
  </Link>
);
