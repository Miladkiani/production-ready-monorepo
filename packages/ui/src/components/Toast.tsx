"use client";

import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { cn } from "../functions";
import { Icon } from "./Icon";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface ToastOptions {
  position?: ToastPosition;
  duration?: number; // auto-dismiss in ms
}

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  options?: ToastOptions;
}

type ToastFn = (
  toast: {
    title: string;
    description?: string;
  },
  options?: ToastOptions,
) => void;

interface ToastStore {
  toasts: ToastData[];
  add: (toast: ToastData) => void;
  remove: (id: string) => void;
}

const toastStore: ToastStore = {
  toasts: [],
  add(toast) {
    this.toasts.push(toast);
  },
  remove(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  },
};

let toastRoot: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

function createToastRoot() {
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = "toast-root";
    document.body.appendChild(toastRoot);
    root = createRoot(toastRoot);
    root.render(<ToastViewport />);
  }
}

const exitingToasts = new Set<string>();

function getToastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        bg: "bg-success-light dark:bg-success-dark",
        border: "border-success dark:border-success",
        icon: "CheckCircle2" as const,
        iconColor: "text-success dark:text-success",
        iconBg: "bg-success/10 dark:bg-success/20",
        progress: "bg-success",
      };
    case "error":
      return {
        bg: "bg-error-light dark:bg-error-dark",
        border: "border-error dark:border-error",
        icon: "XCircle" as const,
        iconColor: "text-error dark:text-error",
        iconBg: "bg-error/10 dark:bg-error/20",
        progress: "bg-error",
      };
    case "warning":
      return {
        bg: "bg-warning-light dark:bg-warning-dark",
        border: "border-warning dark:border-warning",
        icon: "AlertTriangle" as const,
        iconColor: "text-warning dark:text-warning",
        iconBg: "bg-warning/10 dark:bg-warning/20",
        progress: "bg-warning",
      };
    case "info":
      return {
        bg: "bg-info-light dark:bg-info-dark",
        border: "border-info dark:border-info",
        icon: "Info" as const,
        iconColor: "text-info dark:text-info",
        iconBg: "bg-info/10 dark:bg-info/20",
        progress: "bg-info",
      };
  }
}

function getSlideClass(position: ToastPosition, isExiting: boolean) {
  if (isExiting) {
    switch (position) {
      case "top-left":
      case "bottom-left":
        return "translate-x-[-120%] opacity-0 scale-95";
      case "top-right":
      case "bottom-right":
        return "translate-x-[120%] opacity-0 scale-95";
    }
  } else {
    switch (position) {
      case "top-left":
      case "bottom-left":
        return "translate-x-0 opacity-100 scale-100";
      case "top-right":
      case "bottom-right":
        return "translate-x-0 opacity-100 scale-100";
    }
  }
}

function getExitTransform(position: ToastPosition) {
  switch (position) {
    case "top-left":
    case "bottom-left":
      return "translateX(-100%)";
    case "top-right":
    case "bottom-right":
      return "translateX(100%)";
  }
}

function ToastItem({
  toast: t,
  position,
  index,
  onClose,
}: {
  toast: ToastData;
  position: ToastPosition;
  index: number;
  onClose: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const isExiting = exitingToasts.has(t.id);
  const styles = getToastStyles(t.type);
  const duration = t.options?.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      key={t.id}
      role="status"
      aria-live="polite"
      style={{
        transform: isExiting
          ? getExitTransform(position)
          : `translateY(${position.includes("top") ? index * 4 : -index * 4}px)`,
        transitionDelay: `${index * 50}ms`,
      }}
      className={cn(
        "relative w-full sm:w-96 rounded-xl border backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out",
        styles.bg,
        styles.border,
        getSlideClass(position, isExiting),
      )}
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={cn(
              "h-full transition-all duration-100 ease-linear",
              styles.progress,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 pt-5">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            styles.iconBg,
          )}
        >
          <Icon name={styles.icon} size={20} className={styles.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-semibold text-sm text-text-primary mb-0.5">
            {t.title}
          </p>
          {t.description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {t.description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(t.id)}
          aria-label="Close notification"
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            "text-text-muted hover:text-text-secondary",
            "hover:bg-surface-hover",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "focus:ring-primary",
          )}
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
}

function ToastViewport() {
  const [items, setItems] = useState<ToastData[]>(toastStore.toasts);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems([...toastStore.toasts]);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!items.length) return null;

  const position = items[0].options?.position ?? "top-right";

  const handleClose = (id: string) => {
    exitingToasts.add(id);
    setTimeout(() => {
      exitingToasts.delete(id);
      toastStore.remove(id);
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-3 p-4 pointer-events-none",
        position.includes("top") ? "top-0" : "bottom-0",
        position.includes("left") ? "left-0" : "right-0",
      )}
    >
      <div className="flex flex-col gap-3 pointer-events-auto">
        {items.map((t, idx) => (
          <ToastItem
            key={t.id}
            toast={t}
            position={position}
            index={idx}
            onClose={handleClose}
          />
        ))}
      </div>
    </div>
  );
}

function showToast(type: ToastType, toast: Omit<ToastData, "type" | "id">) {
  createToastRoot();
  const id = crypto.randomUUID();
  const toastData: ToastData = {
    id,
    type,
    ...toast,
  };
  toastStore.add(toastData);

  const duration = toast.options?.duration ?? 4000;
  if (duration > 0) {
    setTimeout(() => {
      exitingToasts.add(id);
      setTimeout(() => {
        exitingToasts.delete(id);
        toastStore.remove(id);
      }, 300);
    }, duration);
  }
}

export const toast = {
  success: (toast: Omit<ToastData, "type" | "id">) =>
    showToast("success", toast),
  error: (toast: Omit<ToastData, "type" | "id">) => showToast("error", toast),
  warning: (toast: Omit<ToastData, "type" | "id">) =>
    showToast("warning", toast),
  info: (toast: Omit<ToastData, "type" | "id">) => showToast("info", toast),
};
