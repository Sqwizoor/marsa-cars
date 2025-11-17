"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function ForceLightTheme() {
  const { setTheme } = useTheme();
  useEffect(() => {
    // Force next-themes state and HTML class to light
    try {
      setTheme("light");
      const root = document.documentElement;
      root.classList.remove("dark");
      // Keep localStorage consistent to prevent rehydration flicker
      window.localStorage.setItem("theme", "light");
      window.localStorage.setItem("next-theme", "light");
    } catch {}
  }, [setTheme]);
  return null;
}
