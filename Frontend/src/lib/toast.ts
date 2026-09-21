/**
 * Custom toast notification system (independent of sonner).
 * Uses a simple pub/sub event emitter pattern — no external dependencies.
 */

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type Listener = (toasts: Toast[]) => void;

// ─── Internal store ───────────────────────────────────────────────────────────

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

/** Notify all subscribers with the current toast list. */
function emit() {
  listeners.forEach((fn) => fn([...toasts]));
}

/** Generate a lightweight unique ID (no external UUID dep). */
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Push a new toast notification.
 *
 * @param message  Text to display inside the toast.
 * @param type     Visual variant — 'success' | 'error' | 'info' | 'warning'.
 * @param duration Auto-dismiss delay in ms (default: 4000).
 * @returns        The id of the created toast.
 */
export function createToast(
  message: string,
  type: ToastType = "info",
  duration = 4000
): string {
  const id = uid();
  const toast: Toast = { id, message, type, duration };

  // Keep at most 5 toasts in the stack
  toasts = [toast, ...toasts].slice(0, 5);
  emit();

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }

  return id;
}

/**
 * Programmatically dismiss a toast by id.
 */
export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * React hook that subscribes to the toast store.
 *
 * @returns `{ toasts, dismiss }` — current toast list and dismiss callback.
 */
export function useToast(): { toasts: Toast[]; dismiss: (id: string) => void } {
  const [state, setState] = useState<Toast[]>([...toasts]);

  useEffect(() => {
    // Sync state immediately (in case toasts were added before mount)
    setState([...toasts]);

    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return { toasts: state, dismiss: dismissToast };
}
