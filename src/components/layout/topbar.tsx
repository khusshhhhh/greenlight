"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth-actions";
import type { NotificationItem } from "@/lib/queries";

interface TopbarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function Topbar({
  user,
  notifications,
  notificationsEnabled,
}: {
  user: TopbarUser;
  notifications: NotificationItem[];
  notificationsEnabled: boolean;
}) {
  const router = useRouter();
  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:gap-4 md:px-6">
      <MobileNav />

      <form
        className="relative min-w-0 flex-1 sm:max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString().trim();
          router.push(q ? `/projects?q=${encodeURIComponent(q)}` : "/projects");
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" placeholder="Search projects…" className="pl-9" />
      </form>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <NotificationPanel notifications={notifications} enabled={notificationsEnabled} />
        <ThemeToggle />
        <Button asChild size="sm">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </Link>
        </Button>

        <Separator orientation="vertical" className="mx-1 hidden h-7 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-transparent transition hover:ring-ring/40"
              aria-label="Account menu"
            >
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user.name}</div>
              <div className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => logout()}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
