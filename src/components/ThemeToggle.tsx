import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { useChrome } from "@/layouts/ChromeContext";

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
      className={cn("relative", !mounted && "opacity-0")}
    >
      <Icon name={isDark ? "sun" : "moon"} className="h-5 w-5" aria-hidden />
    </Button>
  );
};
