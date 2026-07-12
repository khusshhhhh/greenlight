"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Cycles through `words`, typing and deleting each with a blinking caret.
 * Honours prefers-reduced-motion (shows the first word statically).
 */
export function Typewriter({
  words,
  className,
  typingSpeed = 85,
  deletingSpeed = 40,
  pause = 1500,
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
}) {
  const [index, setIndex] = React.useState(0);
  const [sub, setSub] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
  }, []);

  React.useEffect(() => {
    if (reduced || words.length === 0) return;
    const current = words[index % words.length];
    let t: ReturnType<typeof setTimeout>;

    if (!deleting && sub < current.length) {
      t = setTimeout(() => setSub(sub + 1), typingSpeed);
    } else if (!deleting && sub === current.length) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && sub > 0) {
      t = setTimeout(() => setSub(sub - 1), deletingSpeed);
    } else {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [sub, deleting, index, words, reduced, typingSpeed, deletingSpeed, pause]);

  const text = reduced ? words[0] ?? "" : (words[index % words.length] ?? "").slice(0, sub);

  return (
    <span className={cn("whitespace-nowrap", className)}>
      {text}
      <span className="gl-caret" aria-hidden>
        |
      </span>
    </span>
  );
}
