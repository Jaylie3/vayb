import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-dark px-5 text-white">
    <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-blob" aria-hidden />
    <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-secondary/30 blur-3xl animate-blob [animation-delay:3s]" aria-hidden />

    <div className="relative max-w-lg text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-sunset shadow-glow">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold sm:text-6xl">
        This <span className="text-gradient-sunset">vayb</span> doesn't exist.
      </h1>
      <p className="mt-3 text-white/70">
        The page you're looking for has moved on to the next event. Let's find you a new one.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="hero" size="lg">
          <Link to="/">Back to discover</Link>
        </Button>
        <Button asChild variant="glass" size="lg">
          <Link to="/#categories">Browse categories</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default NotFound;
