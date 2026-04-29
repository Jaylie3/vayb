import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChrome } from "@/layouts/ChromeContext";

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

/** Toggles between light and dark themes. */
export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { transparent } = useChrome();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <Button
      variant={transparent ? "glass" : "ghost"}
      size="icon"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={cn(!mounted && "opacity-0")}
    >
      {isDark ? <SunIcon className="h-5 w-5" aria-hidden /> : <MoonIcon className="h-5 w-5" aria-hidden />}
    </Button>
  );
};
