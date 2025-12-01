/**
 * theme.js - Theme switcher with localStorage persistence
 * Handles light/dark mode toggle with system preference detection
 */

(function () {
  "use strict";

  const STORAGE_KEY = "theme-preference";
  const THEME_ATTR = "data-theme";

  // Get user's preference
  // sourcery skip: avoid-function-declarations-in-blocks
  function getThemePreference() {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    // Fall back to system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  }

  // Set theme on document
  function setTheme(theme) {
    document.documentElement.setAttribute(THEME_ATTR, theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButton(theme);
  }

  // Update button icon
  function updateToggleButton(theme) {
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");

    if (!sunIcon || !moonIcon) return;

    if (theme === "dark") {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
    } else {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
    }
  }

  // Toggle theme
  function toggleTheme() {
    const current = document.documentElement.getAttribute(THEME_ATTR);
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);

    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Theme changed to ${next} mode`;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  }

  // Initialize theme immediately (before content paints)
  const initialTheme = getThemePreference();
  setTheme(initialTheme);

  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", function () {
    // Update button state
    updateToggleButton(initialTheme);

    // Add click handler to toggle button
    const toggleBtn = document.querySelector(".theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTheme);
    }

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", (e) => {
          // Only update if user hasn't set a manual preference
          if (!localStorage.getItem(STORAGE_KEY)) {
            setTheme(e.matches ? "dark" : "light");
          }
        });
      }
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener((e) => {
          if (!localStorage.getItem(STORAGE_KEY)) {
            setTheme(e.matches ? "dark" : "light");
          }
        });
      }
    }
  });

  // Screen reader only utility class
  if (!document.querySelector("style[data-theme-styles]")) {
    const style = document.createElement("style");
    style.setAttribute("data-theme-styles", "");
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);
  }
})();
