import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { CalendarView, type CalendarEvent } from "@/components/calendar-view";
import { isTaskDone } from "@/lib/business";
import { daysRemaining } from "@/lib/dates";
import { WORKFLOW_SHORT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const userId = await requireUserId();
  const [tasks, rfis] = await Promise.all([
    prisma.task.findMany({
      where: {
        dueDate: { not: null },
        project: { ownerId: userId, status: { notIn: ["ARCHIVED", "CANCELLED"] } },
      },
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.rFI.findMany({
      where: { dueDate: { not: null }, project: { ownerId: userId } },
      include: { project: { select: { id: true, name: true } } },
    }),
  ]);

  const events: CalendarEvent[] = [];

  for (const t of tasks) {
    if (!t.dueDate) continue;
    const done = isTaskDone(t.status);
    const overdue = !done && (daysRemaining(t.dueDate) ?? 0) < 0;
    events.push({
      id: `t-${t.id}`,
      date: t.dueDate.toISOString(),
      label: `${t.title} · ${t.project.name}`,
      projectId: t.project.id,
      tone: done ? "green" : overdue ? "red" : "amber",
    });
  }

  for (const r of rfis) {
    if (!r.dueDate) continue;
    events.push({
      id: `r-${r.id}`,
      date: r.dueDate.toISOString(),
      label: `${WORKFLOW_SHORT[r.workflowType]} RFI ${r.rfiNumber} · ${r.project.name}`,
      projectId: r.project.id,
      tone: r.status === "CLOSED" ? "green" : "blue",
    });
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Due dates, expected completions, RFI responses and approval milestones."
      />
      <CalendarView events={events} />
    </div>
  );
}
