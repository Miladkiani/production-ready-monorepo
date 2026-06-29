"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface SecuritySettingsContextValue {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const SecuritySettingsContext = createContext<
  SecuritySettingsContextValue | undefined
>(undefined);

/**
 * Security Settings Provider
 *
 * Provides global state management for security settings modal
 * Ensures modal state is synchronized across header menu and dashboard
 * Optimized for performance with memoization
 */
export function SecuritySettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isModalOpen, openModal, closeModal }),
    [isModalOpen, openModal, closeModal],
  );

  return (
    <SecuritySettingsContext.Provider value={value}>
      {children}
    </SecuritySettingsContext.Provider>
  );
}

/**
 * Hook to access security settings modal state
 * Throws error if used outside provider
 */
export function useSecuritySettingsModal() {
  const context = useContext(SecuritySettingsContext);
  if (!context) {
    throw new Error(
      "useSecuritySettingsModal must be used within SecuritySettingsProvider",
    );
  }
  return context;
}
