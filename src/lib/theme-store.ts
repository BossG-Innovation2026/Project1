export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : null;
}

export function getSnapshot(): Theme {
  return getStoredTheme() ?? "system";
}

export function getServerSnapshot(): Theme {
  return "system";
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = resolveTheme(theme);
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  listeners.forEach((l) => l());
}

export function cycleTheme(current: Theme): Theme {
  const order: Theme[] = ["light", "dark", "system"];
  return order[(order.indexOf(current) + 1) % order.length];
}
