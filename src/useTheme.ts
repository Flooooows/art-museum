import { useEffect, useState } from "react";
import {
  parseTheme,
  readThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "./theme";

export function useTheme() {
  const [preference, setPreference] = useState(readThemePreference);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const theme = resolveTheme(preference, systemDark);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => setSystemDark(media.matches);
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreference(parseTheme(event.newValue));
      }
    };
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorageChange);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#210a12" : "#fbf9f4");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setPreference(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The theme remains usable for this session when browser storage is blocked.
    }
  };

  return { theme, toggleTheme };
}
