"use client";

import { useEffect, useState } from "react";
import { Icon } from "@repo/ui";

/**
 * BackToTop - Floating button that appears after scrolling down
 * Smoothly scrolls to the top of the page when clicked
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when scrolled down 400px
      setIsVisible(window.scrollY > 400);
    };

    // Initial check
    toggleVisibility();

    // Throttled scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50
        p-3 rounded-full
        bg-primary hover:bg-primary-hover
        text-white
        shadow-lg hover:shadow-xl
        transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"}
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
        group
      `}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <Icon
        name="ArrowUp"
        size={24}
        className="transition-transform duration-300 group-hover:-translate-y-1"
      />
    </button>
  );
}

// Default export for dynamic import
export default BackToTop;
