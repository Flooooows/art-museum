export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "muse-theme";

export function parseTheme(value: string | null): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function resolveTheme(
  preference: Theme | null,
  systemDark: boolean,
): Theme {
  return preference ?? (systemDark ? "dark" : "light");
}

export function readThemePreference(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}
