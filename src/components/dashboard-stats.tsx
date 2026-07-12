import {
  FolderKanban,
  Landmark,
  AlarmClock,
  FileWarning,
  Users,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats as Stats } from "@/lib/queries";
import { CountUp } from "@/components/count-up";
import { cn } from "@/lib/utils";

const ICONS = {
  FolderKanban,
  Landmark,
  AlarmClock,
  FileWarning,
  Users,
  CheckCircle2,
  Timer,
} as const;

function Stat({
  label,
  value,
  hint,
  icon,
  tone = "grey",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: keyof typeof ICONS;
  tone?: "grey" | "amber" | "red" | "green" | "blue";
}) {
  const Icon = ICONS[icon];
  const toneClass = {
    grey: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  }[tone];

  return (
    <Card className="gl-hover-lift">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {typeof value === "number" ? <CountUp value={value} /> : value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Active projects" value={stats.activeProjects} icon="FolderKanban" tone="blue" />
      <Stat
        label="Waiting on council"
        value={stats.waitingOnCouncil}
        icon="Landmark"
        tone="amber"
        hint="Lodged or awaiting reply"
      />
      <Stat
        label="Projects with overdue tasks"
        value={stats.overdueProjects}
        icon="AlarmClock"
        tone="red"
        hint={`${stats.overdueTaskCount} overdue tasks`}
      />
      <Stat
        label="Open RFIs"
        value={stats.openRfiCount}
        icon="FileWarning"
        tone="red"
        hint={`across ${stats.openRfiProjects} projects`}
      />
      <Stat
        label="Waiting on consultants"
        value={stats.waitingOnConsultants}
        icon="Users"
        tone="amber"
      />
      <Stat
        label="Approved this month"
        value={stats.approvedThisMonth}
        icon="CheckCircle2"
        tone="green"
      />
      <Stat
        label="Avg approval duration"
        value={stats.avgApprovalDays != null ? `${stats.avgApprovalDays}d` : "—"}
        icon="Timer"
        tone="grey"
        hint="Start → planning approval"
      />
    </div>
  );
}
