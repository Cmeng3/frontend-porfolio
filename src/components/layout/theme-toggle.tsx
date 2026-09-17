"use client";

import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("portfolio-theme");
      } catch {
        /* Storage may be disabled. */
      }
      document.documentElement.dataset.theme =
        saved === "light" || saved === "dark"
          ? saved
          : media.matches
            ? "dark"
            : "light";
    };
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => {
        const theme =
          document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        try {
          localStorage.setItem("portfolio-theme", theme);
        } catch {
          /* Still works for this page session. */
        }
      }}
    >
      <span className="theme-light-icon">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z" />
        </svg>
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="theme-dark-icon">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </svg>
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}
