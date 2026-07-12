import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder with a shimmer sweep. Use to reserve layout while data
 * loads (see the route-level loading.tsx files).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("gl-shimmer rounded-md bg-muted/70", className)}
      {...props}
    />
  );
}
