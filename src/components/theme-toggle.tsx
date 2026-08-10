"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  applyTheme,
  cycleTheme,
  getServerSnapshot,
  getSnapshot,
  setTheme,
  subscribe,
  type Theme,
} from "@/lib/theme-store";

const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LABELS: Record<Theme, string> = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System mode",
};

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(getSnapshot());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getSnapshot() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const Icon = ICONS[theme];

  return (
    <button
      onClick={() => setTheme(cycleTheme(theme))}
      title={LABELS[theme]}
      className="flex h-9 w-9 items-center justify-center rounded-md bg-panel-hover text-foreground hover:bg-accent hover:text-on-accent"
    >
      <Icon size={18} />
    </button>
  );
}
