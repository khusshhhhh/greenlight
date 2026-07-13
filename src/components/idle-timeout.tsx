"use client";

import * as React from "react";
import { logout } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

// Sign the user out after this much inactivity; warn shortly before.
const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE_MS = 60 * 1000; // warn 60s before logout

export function IdleTimeout() {
  const [warning, setWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);
  const idleTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const warnTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const tick = React.useRef<ReturnType<typeof setInterval>>();

  const reset = React.useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(tick.current);
    setWarning(false);

    warnTimer.current = setTimeout(() => {
      setWarning(true);
      setCountdown(Math.round(WARN_BEFORE_MS / 1000));
      tick.current = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    }, IDLE_LIMIT_MS - WARN_BEFORE_MS);

    idleTimer.current = setTimeout(() => {
      void logout();
    }, IDLE_LIMIT_MS);
  }, []);

  React.useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const onActivity = () => {
      // While the warning is showing, only an explicit button press should
      // dismiss it — ignore background activity so the countdown is trustworthy.
      if (!warning) reset();
    };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimeout(idleTimer.current);
      clearTimeout(warnTimer.current);
      clearInterval(tick.current);
    };
  }, [reset, warning]);

  if (!warning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-xl border bg-background p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Still there?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll be signed out in <span className="font-semibold text-foreground">{countdown}s</span>{" "}
          due to inactivity, to keep your account secure.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset} className="flex-1">
            Stay signed in
          </Button>
          <Button variant="outline" onClick={() => logout()} className="flex-1">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
