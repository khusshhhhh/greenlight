import { Check } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Planning Approval", detail: "Approved · lodged in PlanSA", tone: "done" },
  { label: "Development / BRC", detail: "In progress · certifier review", tone: "active" },
  { label: "Land Division", detail: "Up next · SA Water & titles", tone: "upcoming" },
] as const;

/** Decorative, animated "approval pipeline" illustration for the landing hero. */
export function HeroGraphic() {
  return (
    <div className="relative mx-auto mt-16 max-w-lg">
      {/* soft glow */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-teal-500/10 blur-3xl"
      />

      <div className="gl-float relative rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-2.5">
          <LogoMark animated className="h-7 w-7" />
          <span className="text-sm font-semibold">Approval pipeline</span>
          <span className="ml-auto rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
            67% complete
          </span>
        </div>

        <ol className="relative ml-1 space-y-5 border-l pl-6">
          {STAGES.map((s) => (
            <li key={s.label} className="relative">
              <span
                className={cn(
                  "absolute -left-[1.72rem] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card",
                  s.tone === "done" && "bg-teal-500 text-white",
                  s.tone === "active" && "bg-amber-500",
                  s.tone === "upcoming" && "bg-slate-300 dark:bg-slate-600"
                )}
              >
                {s.tone === "done" && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                {s.tone === "active" && (
                  <span className="absolute h-4 w-4 animate-ping rounded-full bg-amber-500/60" />
                )}
              </span>
              <p
                className={cn(
                  "text-sm font-medium",
                  s.tone === "upcoming" && "text-muted-foreground"
                )}
              >
                {s.label}
              </p>
              <p className="text-xs text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall progress</span>
            <span className="font-medium text-foreground">67%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-teal-500 to-teal-400" />
          </div>
        </div>
      </div>

      {/* floating mini-badges */}
      <div className="gl-float absolute -right-4 -top-4 hidden rounded-xl border bg-card px-3 py-2 shadow-lg sm:block" style={{ animationDelay: "0.6s" }}>
        <p className="text-xs text-muted-foreground">Open RFIs</p>
        <p className="text-lg font-semibold text-red-500">2</p>
      </div>
      <div className="gl-float absolute -bottom-4 -left-4 hidden rounded-xl border bg-card px-3 py-2 shadow-lg sm:block" style={{ animationDelay: "1.1s" }}>
        <p className="text-xs text-muted-foreground">Avg approval</p>
        <p className="text-lg font-semibold text-teal-500">48d</p>
      </div>
    </div>
  );
}
