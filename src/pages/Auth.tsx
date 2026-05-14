import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | "apple" | null>(null);

  // If already signed in, bounce back to where they came from
  useEffect(() => {
    if (!loading && user) {
      const next = params.get("next") || "/";
      navigate(next, { replace: true });
    }
  }, [user, loading, params, navigate]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy("email");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: name.trim() ? { full_name: name.trim() } : undefined,
          },
        });
        if (error) throw error;
        toast.success("Check your inbox", {
          description: "We've sent a verification link to confirm your email.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back to the vayb.");
        navigate(params.get("next") || "/", { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(mode === "signup" ? "Could not create account" : "Could not sign in", { description: msg });
    } finally {
      setBusy(null);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        const msg = result.error instanceof Error ? result.error.message : String(result.error);
        toast.error(`Could not sign in with ${provider}`, { description: msg });
        setBusy(null);
        return;
      }
      if (result.redirected) return; // browser is leaving
      navigate(params.get("next") || "/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(`Could not sign in with ${provider}`, { description: msg });
      setBusy(null);
    }
  };

  return (
    <div className="relative -mt-16 flex min-h-screen items-center justify-center overflow-hidden bg-gradient-dark px-5 py-20 text-white">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-secondary/30 blur-3xl animate-blob [animation-delay:3s]" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-pop backdrop-blur-xl sm:p-9">
          <h1 className="font-display text-3xl font-bold leading-tight">
            {mode === "signin" ? <>Welcome back to </> : <>Find your next </>}
            <span className="lowercase tracking-tight">
              <span style={{ color: "#F39200" }}>v</span>
              <span style={{ color: "#E63946" }}>a</span>
              <span style={{ color: "#E63946" }}>y</span>
              <span style={{ color: "#5C3A6E" }}>b</span>
              <span>.</span>
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {mode === "signin"
              ? "Sign in to grab tickets, save events, and get reminders on WhatsApp."
              : "Create an account in seconds. Tickets land on WhatsApp."}
          </p>

          {/* OAuth */}
          <div className="mt-7 grid gap-2.5">
            <button
              type="button"
              onClick={() => oauth("google")}
              disabled={!!busy}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-white text-sm font-semibold text-zinc-900 transition-smooth hover:bg-white/90 disabled:opacity-60"
            >
              <GoogleGlyph className="h-4 w-4" />
              {busy === "google" ? "Connecting…" : "Continue with Google"}
            </button>
            <button
              type="button"
              onClick={() => oauth("apple")}
              disabled={!!busy}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-black text-sm font-semibold text-white transition-smooth hover:bg-black/85 disabled:opacity-60"
            >
              <AppleGlyph className="h-4 w-4" />
              {busy === "apple" ? "Connecting…" : "Continue with Apple"}
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            <span className="h-px flex-1 bg-white/10" /> Or with email <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* Email + password */}
          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="text-white/80">Full name <span className="text-white/40">(optional)</span></Label>
                <Input
                  id="name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Lerato Khumalo"
                  className="mt-1.5 h-11 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1.5 h-11 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Input
                id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                className="mt-1.5 h-11 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
              />
            </div>

            <Button type="submit" variant="hero" size="lg" disabled={!!busy} className="w-full">
              {busy === "email"
                ? (mode === "signup" ? "Creating account…" : "Signing in…")
                : (mode === "signup"
                  ? <>Create account <Icon name="arrow-right" className="h-4 w-4" aria-hidden /></>
                  : <>Sign in <Icon name="arrow-right" className="h-4 w-4" aria-hidden /></>
                )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            {mode === "signin" ? (
              <>New to Vayb?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-primary-glow hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>Already on Vayb?{" "}
                <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-primary-glow hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-white/50">
          By continuing you agree to our <Link to="/" className="underline hover:text-white">Terms</Link> &amp;{" "}
          <Link to="/" className="underline hover:text-white">Privacy</Link>.
        </p>
        <p className={cn("mt-2 text-center text-xs text-white/50")}>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-white">
            <Icon name="arrow-left" className="h-3 w-3" aria-hidden /> Back to discover
          </Link>
        </p>
      </div>
    </div>
  );
};

/* Brand glyphs kept inline so we don't pull a logo dependency. */
const GoogleGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.65 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.86 3.4 14.66 2.4 12 2.4 6.92 2.4 2.8 6.5 2.8 11.6S6.92 20.8 12 20.8c6.93 0 9.2-4.85 9.2-7.34 0-.49-.05-.86-.12-1.26H12z"/>
  </svg>
);
const AppleGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <path d="M16.365 1.43c0 1.14-.49 2.27-1.27 3.07-.84.86-2.18 1.5-3.27 1.42-.13-1.1.43-2.25 1.18-3.05.85-.9 2.27-1.55 3.36-1.44zM21.5 17.1c-.5 1.16-.74 1.68-1.39 2.7-.9 1.42-2.18 3.2-3.76 3.21-1.4.02-1.76-.92-3.66-.91-1.9.01-2.3.92-3.7.91-1.58-.01-2.78-1.6-3.69-3.02C2.4 16.74 1.92 11.85 4.4 9.18c1.18-1.27 2.94-2.07 4.6-2.07 1.7 0 2.78.93 4.18.93 1.36 0 2.19-.93 4.16-.93 1.49 0 3.07.81 4.2 2.21-3.69 2.02-3.09 7.27.0 7.78z"/>
  </svg>
);

export default Auth;
