"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { NAV } from "@/components/layout/nav-items";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              onClick={() => setOpen(false)}
              className={cn(
                "fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity",
                open ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            />

            {/* Drawer */}
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-[80] flex w-72 max-w-[82%] flex-col border-r bg-card shadow-xl transition-transform duration-300",
                open ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="flex h-16 items-center justify-between border-b px-5">
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Logo />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {NAV.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Greenlight</p>
                <p>Planning · BRC · Land Division</p>
              </div>
            </aside>
          </>,
          document.body
        )}
    </div>
  );
}
