import Link from "next/link";
import { AlarmClock, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/status-badge";
import { fmtDate, daysRemainingLabel } from "@/lib/dates";
import { taskTone } from "@/lib/business";
import type { Task, Project } from "@prisma/client";

type Row = Task & { project: Pick<Project, "id" | "name"> };

function TaskList({ tasks, empty }: { tasks: Row[]; empty: string }) {
  if (tasks.length === 0)
    return <p className="px-6 pb-6 text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="divide-y">
      {tasks.map((t) => (
        <Link
          key={t.id}
          href={`/projects/${t.project.id}`}
          className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <p className="truncate text-xs text-muted-foreground">{t.project.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={
                (daysRemainingLabel(t.dueDate).includes("overdue")
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground") + " text-xs font-medium"
              }
            >
              {fmtDate(t.dueDate)} · {daysRemainingLabel(t.dueDate)}
            </span>
            <TaskStatusBadge status={t.status} tone={taskTone(t)} />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function OverdueTasks({ tasks }: { tasks: Row[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlarmClock className="h-4 w-4 text-red-500" /> Overdue tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <TaskList tasks={tasks} empty="Nothing overdue — great work! 🎉" />
      </CardContent>
    </Card>
  );
}

export function UpcomingTasks({ tasks }: { tasks: Row[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-amber-500" /> Upcoming due dates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <TaskList tasks={tasks} empty="No upcoming due dates." />
      </CardContent>
    </Card>
  );
}
