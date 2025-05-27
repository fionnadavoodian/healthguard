"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Apply the correct class on <html>
  const applyThemeClass = useCallback((selectedTheme: Theme) => {
    const root = document.documentElement;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    root.classList.remove("light", "dark");

    if (selectedTheme === "system") {
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(selectedTheme);
    }
  }, []);

  // Load initial theme from localStorage or system, then apply it
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "system";
    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  // Re-apply theme class whenever theme changes *and* after mounted
  useEffect(() => {
    if (mounted) {
      applyThemeClass(theme);
      if (theme === "system") {
        // Listen to system changes only if theme === system
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => applyThemeClass("system");
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
    }
  }, [theme, mounted, applyThemeClass]);

  // setTheme function updates localStorage and state
  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
    setThemeState(newTheme);
  }, []);

  // toggleTheme cycles through light -> dark -> system -> light
  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      let nextTheme: Theme;
      if (prevTheme === "light") nextTheme = "dark";
      else if (prevTheme === "dark") nextTheme = "system";
      else nextTheme = "light";

      if (nextTheme === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", nextTheme);

      return nextTheme;
    });
  }, []);

  if (!mounted) {
    return null; // prevent hydration mismatch
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
