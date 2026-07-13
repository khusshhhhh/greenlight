"use client";

import * as React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: Variant;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, "id"> & { duration?: number }) => void;
  remove: (id: number) => void;
}

let counter = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: ({ duration = 3200, ...t }) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, duration);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Call from any client handler: toast.success("Updated!") */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().add({ variant: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().add({ variant: "error", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().add({ variant: "info", title, description }),
};

const STYLE: Record<Variant, { Icon: typeof Info; className: string }> = {
  success: { Icon: CheckCircle2, className: "text-emerald-500" },
  error: { Icon: AlertCircle, className: "text-red-500" },
  info: { Icon: Info, className: "text-blue-500" },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const { Icon, className } = STYLE[t.variant];
        return (
          <div
            key={t.id}
            className="gl-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-4 shadow-lg"
            role="status"
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", className)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
