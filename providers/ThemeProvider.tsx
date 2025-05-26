// providers/ThemeProvider.tsx (This is the version we've been working with, should be correct)
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
  const [mounted, setMounted] = useState(false); // New mounted state

  // Function to apply the theme class to the document element
  const applyThemeClass = useCallback(
    (selectedTheme: Theme) => {
      if (!mounted) return; // Only apply if mounted on client
      const root = document.documentElement;
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      root.classList.remove("light", "dark"); // Clean state

      if (selectedTheme === "system") {
        const systemPrefersDark = mediaQuery.matches;
        root.classList.add(systemPrefersDark ? "dark" : "light");
      } else {
        root.classList.add(selectedTheme);
      }
    },
    [mounted]
  ); // Depend on mounted

  // Effect to set mounted state and load initial theme once on client mount
  useEffect(() => {
    setMounted(true); // Component has mounted

    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "system";

    setThemeState(initialTheme);

    // Listener for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (theme === "system") {
        // Only react to system changes if current theme is 'system'
        applyThemeClass("system");
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme, applyThemeClass]);

  // Effect to apply theme class whenever the 'theme' state changes
  // This will also run once after initial mount due to setThemeState in previous effect
  useEffect(() => {
    if (mounted) {
      // Ensure this only runs client-side after mount
      applyThemeClass(theme);
    }
  }, [theme, mounted, applyThemeClass]);

  // Public setTheme function - updates state and localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
  }, []);

  // Public toggleTheme function
  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      let nextTheme: Theme;
      if (prevTheme === "light") {
        nextTheme = "dark";
      } else if (prevTheme === "dark") {
        nextTheme = "system";
      } else {
        // current theme is 'system'
        nextTheme = "light";
      }
      setTheme(nextTheme);
      return nextTheme;
    });
  }, [setTheme]);

  // Render children only after component has mounted to prevent hydration errors from theme
  if (!mounted) {
    return null;
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
