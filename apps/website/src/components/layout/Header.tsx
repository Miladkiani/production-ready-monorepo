"use client";

import { Typography, Icon } from "@repo/ui";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const navigationItems = [
    { label: "Contact", href: "/#contact", icon: "Mail" as const },
  ];

  const handleClose = useCallback(() => setMenuOpen(false), []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) handleClose();
    },
    [handleClose],
  );

  const mobileMenuContent = mounted
    ? createPortal(
        <div
          className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${
            menuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <nav
            id="mobile-menu"
            className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-out ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-lg bg-surface border border-border shadow-md overflow-hidden">
                  <Image
                    src="/icon-192.png"
                    alt="App Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Typography variant="h5" weight="semibold" color="text-primary">
                  Menu
                </Typography>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close navigation menu"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleClose}
                  className="group flex items-center gap-4 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <Icon name={item.icon} size={20} />
                  </div>
                  <Typography variant="body" weight="medium">
                    {item.label}
                  </Typography>
                </Link>
              ))}
            </div>
          </nav>
        </div>,
        document.body,
      )
    : null;

  return (
    <header
      role="banner"
      className={`fixed top-0 z-50 w-full transition-colors duration-300 border-b ${
        isSticky
          ? "bg-background/80 backdrop-blur-md border-border shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
          aria-label="Home"
        >
          <div className="relative w-11 h-11 rounded-lg bg-surface border border-border shadow-md overflow-hidden">
            <Image
              src="/icon-192.png"
              alt="App Logo"
              width={44}
              height={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <Typography
            variant="h4"
            weight="semibold"
            color="text-primary"
            className="hidden lg:block"
          >
            Turborepo Starter
          </Typography>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-3 lg:gap-6 text-sm font-medium text-text-secondary"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors duration-300 hover:text-text-primary focus:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:rounded px-2 py-1"
            >
              {item.label}
            </Link>
          ))}

          <ThemeToggle />
        </nav>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-11 h-11 rounded-xl text-text-primary hover:bg-surface active:bg-surface-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={26} />
          </button>
        </div>
      </div>

      {mobileMenuContent}
    </header>
  );
}
