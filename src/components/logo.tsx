import { cn } from "@/lib/utils";

/**
 * Greenlight logo. `LogoMark` is the standalone badge; `Logo` adds the wordmark.
 * A green "go" light with a forward check — approvals, cleared to proceed.
 */
export function LogoMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gl-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="0.55" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="gl-hi" x1="20" y1="0" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11.5" fill="url(#gl-grad)" />
      {/* subtle top highlight */}
      <rect width="40" height="40" rx="11.5" fill="url(#gl-hi)" />
      {/* open progress ring — a gauge nearing completion / a 'G' opening */}
      <circle
        cx="20"
        cy="20"
        r="9.5"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.85"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="45 15"
        transform="rotate(128 20 20)"
      />
      {/* core check */}
      <path
        d="M15.5 20.4l3.1 3.2 6.2-7.4"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "gl-logo-check" : undefined}
      />
    </svg>
  );
}

export function Logo({
  className,
  textClassName,
  showText = true,
  animated = false,
}: {
  className?: string;
  textClassName?: string;
  showText?: boolean;
  animated?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark animated={animated} />
      {showText && (
        <span className={cn("text-lg font-bold tracking-tight", textClassName)}>
          Green<span className="text-emerald-500">light</span>
        </span>
      )}
    </span>
  );
}
