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
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#gl-grad)" />
      <circle
        cx="20"
        cy="20"
        r="11"
        fill="#fff"
        fillOpacity="0.16"
        className={animated ? "gl-logo-ring" : undefined}
      />
      <path
        d="M14 20.5l4 4 8-9"
        stroke="#fff"
        strokeWidth="3.2"
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
