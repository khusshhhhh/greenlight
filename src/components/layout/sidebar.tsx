"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { NAV } from "@/components/layout/nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Residential Approvals</p>
        <p>Planning · BRC · Land Division</p>
      </div>
    </aside>
  );
}
