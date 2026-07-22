"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bell,
  BellOff,
  X,
  AlarmClock,
  CalendarClock,
  FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/queries";

const ICON = {
  overdue: { Icon: AlarmClock, className: "text-red-500" },
  due: { Icon: CalendarClock, className: "text-amber-500" },
  rfi: { Icon: FileWarning, className: "text-blue-500" },
} as const;

export function NotificationPanel({
  notifications,
  enabled,
}: {
  notifications: NotificationItem[];
  enabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const count = notifications.length;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={`Notifications${count ? ` (${count})` : ""}`}
        aria-expanded={open}
      >
        {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        {enabled && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              onClick={() => setOpen(false)}
              className={cn(
                "fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity",
                open ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            />

            {/* Right slide-over */}
            <aside
              className={cn(
                "fixed inset-y-0 right-0 z-[80] flex w-80 max-w-[88%] flex-col border-l bg-card shadow-xl transition-transform duration-300",
                open ? "translate-x-0" : "translate-x-full"
              )}
              role="dialog"
              aria-label="Notifications"
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="font-semibold">Notifications</span>
                  {enabled && count > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                      {count}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {!enabled ? (
                  <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                    <BellOff className="mx-auto mb-2 h-6 w-6" />
                    Notifications are turned off.
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="mt-1 block font-medium text-primary hover:underline"
                    >
                      Turn on in Settings
                    </Link>
                  </div>
                ) : count === 0 ? (
                  <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                    You&apos;re all caught up 🎉
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {notifications.map((n) => {
                      const { Icon, className } = ICON[n.type];
                      return (
                        <li key={n.id}>
                          <Link
                            href={n.href}
                            onClick={() => setOpen(false)}
                            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                          >
                            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", className)} />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{n.title}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {n.detail}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
