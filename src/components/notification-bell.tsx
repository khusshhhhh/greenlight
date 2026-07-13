"use client";

import Link from "next/link";
import { Bell, BellOff, AlarmClock, CalendarClock, FileWarning } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationItem } from "@/lib/queries";
import { cn } from "@/lib/utils";

const ICON = {
  overdue: { Icon: AlarmClock, className: "text-red-500" },
  due: { Icon: CalendarClock, className: "text-amber-500" },
  rfi: { Icon: FileWarning, className: "text-blue-500" },
} as const;

export function NotificationBell({
  notifications,
  enabled,
}: {
  notifications: NotificationItem[];
  enabled: boolean;
}) {
  const count = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Notifications${count ? ` (${count})` : ""}`}
        >
          {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          {enabled && count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {enabled && count > 0 && (
            <span className="text-xs font-normal text-muted-foreground">{count} new</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!enabled ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            <BellOff className="mx-auto mb-2 h-5 w-5" />
            Notifications are turned off.
            <Link href="/settings" className="mt-1 block font-medium text-primary hover:underline">
              Turn on in Settings
            </Link>
          </div>
        ) : count === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up 🎉
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => {
              const { Icon, className } = ICON[n.type];
              return (
                <DropdownMenuItem key={n.id} asChild>
                  <Link href={n.href} className="flex items-start gap-2.5">
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", className)} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{n.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {n.detail}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
