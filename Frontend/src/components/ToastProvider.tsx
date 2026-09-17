"use client";

/**
 * ToastProvider — renders the global custom toast stack.
 * Mount once near the root of the app (e.g. in layout.tsx).
 *
 * Uses the custom `useToast` hook from @/lib/toast — independent of sonner.
 */

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { Toast, ToastType } from "@/lib/toast";
import { useToast } from "@/lib/toast";

// ─── Config maps ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />,
  error: <XCircle className="h-4 w-4 shrink-0 text-red-400" />,
  info: <Info className="h-4 w-4 shrink-0 text-blue-400" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />,
};

const BORDER_MAP: Record<ToastType, string> = {
  success: "border-emerald-500/30",
  error: "border-red-500/30",
  info: "border-blue-500/30",
  warning: "border-amber-500/30",
};

const GLOW_MAP: Record<ToastType, string> = {
  success: "shadow-emerald-900/30",
  error: "shadow-red-900/30",
  info: "shadow-blue-900/30",
  warning: "shadow-amber-900/30",
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <motion.div
      key={toast.id}
      layout
      initial={{ opacity: 0, x: 72, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 72, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={[
        "flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]",
        "rounded-xl border px-4 py-3",
        "bg-slate-900/95 backdrop-blur-md",
        "shadow-lg",
        BORDER_MAP[toast.type],
        GLOW_MAP[toast.type],
      ].join(" ")}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <span className="mt-0.5">{ICON_MAP[toast.type]}</span>

      {/* Message */}
      <p className="flex-1 text-sm leading-snug text-white/90 break-words">
        {toast.message}
      </p>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="mt-0.5 shrink-0 rounded-md p-0.5 text-white/40 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-[200] flex flex-col gap-2 items-end"
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastProvider;
