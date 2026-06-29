"use client";

import { useState, useEffect } from "react";

interface HeaderClientProps {
  children: (props: {
    isSticky: boolean;
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
  }) => React.ReactNode;
}

/**
 * Client-side wrapper for Header - only handles interactive state
 * Minimizes client-side JavaScript by keeping static content in Server Component
 */
export function HeaderClient({ children }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <>{children({ isSticky, menuOpen, setMenuOpen })}</>;
}
