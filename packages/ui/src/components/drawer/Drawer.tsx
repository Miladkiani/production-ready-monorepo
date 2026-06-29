"use client";

import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../../functions";
import { Typography } from "../Typography";
import { Button } from "../Button";

type DrawerPosition = "left" | "right";

export type DrawerRefType<TData = unknown> = {
  open: (data?: TData) => void;
  close: () => void;
};

type DrawerComponent = <T = unknown>(
  props: DrawerProps<T> & { ref?: ForwardedRef<DrawerRefType<T>> },
) => ReturnType<typeof DrawerCore>;

interface DrawerProps<TData = unknown> {
  position?: DrawerPosition;
  title: string | ((data: TData | null) => React.ReactNode);
  header?: ReactNode;
  hasCloseButton?: boolean;
  hasOverlay?: boolean;
  className?: string;
  children: ReactNode | ((isOpen: boolean, data: TData | null) => ReactNode);
  onClose?: () => void;
}

export const DrawerCore = <TData = unknown,>(
  {
    position = "right",
    title,
    header,
    hasCloseButton = true,
    hasOverlay = true,
    className,
    children,
    onClose,
  }: DrawerProps<TData>,
  ref: ForwardedRef<DrawerRefType<TData>>,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Imperative API
  useImperativeHandle(
    ref,
    () => ({
      open: (incoming?: TData) => {
        setData(incoming ?? null);
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
    }),
    [],
  );

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
      onClose?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transform classes
  const transformClass = isOpen
    ? "translate-x-0"
    : position === "right"
      ? "translate-x-full"
      : "-translate-x-full";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300",
        isOpen
          ? "visible pointer-events-auto"
          : "invisible pointer-events-none",
      )}
      ref={overlayRef}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      {hasOverlay && (
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "absolute top-0 h-full bg-surface transform transition-transform duration-300 ease-in-out flex flex-col",
          position === "right"
            ? "right-0 min-w-96 w-96 shadow-2xl shadow-black/25 border-l border-border/50"
            : "left-0 min-w-96 w-96 shadow-2xl shadow-black/25 border-r border-border/50",
          transformClass,
          className,
        )}
        style={{
          boxShadow:
            position === "right"
              ? "-12px 0 40px rgba(0, 0, 0, 0.2), -6px 0 20px rgba(0, 0, 0, 0.15), -2px 0 8px rgba(0, 0, 0, 0.1)"
              : "12px 0 40px rgba(0, 0, 0, 0.2), 6px 0 20px rgba(0, 0, 0, 0.15), 2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        {header ? (
          header
        ) : (
          <div className="flex items-center justify-between relative border-b border-border/30 bg-gradient-to-r from-primary/8 via-primary/4 to-primary/8 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 flex-1">
              {hasCloseButton && (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  aria-label="Close drawer"
                  size="md"
                  isRounded
                  color="mute"
                  iconOnly
                  icon="X"
                />
              )}
              <Typography
                id="drawer-title"
                as="h2"
                variant="h5"
                className="font-semibold text-text/90 tracking-tight flex-1 text-center"
              >
                {typeof title === "function" ? title(data) : title}
              </Typography>
              {hasCloseButton && <div className="w-10" />}{" "}
              {/* Spacer for centering */}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex-1 overflow-y-auto p-4">
            {typeof children === "function" ? children(isOpen, data) : children}
          </div>
        )}
      </div>
    </div>
  );
};

export const Drawer = forwardRef(DrawerCore) as DrawerComponent;
