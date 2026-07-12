import { prisma } from "./prisma";
import { isTaskOverdue } from "./business";
import { OPEN_RFI_STATUSES } from "./constants";
import { startOfMonth, endOfMonth, differenceInCalendarDays } from "date-fns";
import type { Prisma } from "@prisma/client";

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

const activeProjectScope = (userId: string): Prisma.ProjectWhereInput => ({
  ownerId: userId,
  status: { notIn: ["ARCHIVED", "CANCELLED"] },
});

export async function getDashboardStats(userId: string) {
  const [projects, openRfiCount, tasks, approvedThisMonth] = await Promise.all([
    prisma.project.findMany({
      where: activeProjectScope(userId),
      select: { id: true, status: true },
    }),
    prisma.rFI.count({
      where: { status: { in: OPEN_RFI_STATUSES }, project: { ownerId: userId } },
    }),
    prisma.task.findMany({
      where: { project: activeProjectScope(userId) },
      select: { id: true, projectId: true, status: true, dueDate: true, responsibleParty: true },
    }),
    prisma.project.count({
      where: {
        ownerId: userId,
        status: { in: ["APPROVED", "COMPLETED"] },
        updatedAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
      },
    }),
  ]);

  const overdueTasks = tasks.filter(isTaskOverdue);
  const overdueProjectIds = new Set(overdueTasks.map((t) => t.projectId));
  const waitingProjectIds = new Set(
    tasks.filter((t) => t.status === "WAITING" || t.status === "LODGED").map((t) => t.projectId)
  );

  const rfiProjectIds = new Set(
    (
      await prisma.rFI.findMany({
        where: { status: { in: OPEN_RFI_STATUSES }, project: { ownerId: userId } },
        select: { projectId: true },
      })
    ).map((r) => r.projectId)
  );

  const consultantWaitingIds = new Set(
    tasks
      .filter(
        (t) =>
          (t.status === "REQUESTED" || t.status === "IN_PROGRESS") &&
          t.responsibleParty &&
          !/internal/i.test(t.responsibleParty)
      )
      .map((t) => t.projectId)
  );

  const approved = await prisma.task.findMany({
    where: {
      templateKey: "planning-approval",
      status: "APPROVED",
      completedDate: { not: null },
      project: { ownerId: userId },
    },
    include: { project: { select: { startDate: true } } },
  });
  const durations = approved
    .filter((t) => t.project.startDate && t.completedDate)
    .map((t) => differenceInCalendarDays(t.completedDate!, t.project.startDate!));
  const avgApprovalDays =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  return {
    activeProjects: projects.length,
    waitingOnCouncil: waitingProjectIds.size,
    overdueProjects: overdueProjectIds.size,
    overdueTaskCount: overdueTasks.length,
    openRfiProjects: rfiProjectIds.size,
    openRfiCount,
    waitingOnConsultants: consultantWaitingIds.size,
    approvedThisMonth,
    avgApprovalDays,
  };
}

export async function getUpcomingTasks(userId: string, limit = 8) {
  return prisma.task.findMany({
    where: {
      dueDate: { not: null },
      status: { notIn: ["COMPLETED", "APPROVED", "RECEIVED", "CANCELLED"] },
      project: activeProjectScope(userId),
    },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { project: { select: { id: true, name: true } } },
  });
}

export async function getOverdueTasks(userId: string, limit = 10) {
  return prisma.task.findMany({
    where: {
      dueDate: { lt: new Date() },
      status: { notIn: ["COMPLETED", "APPROVED", "RECEIVED", "CANCELLED"] },
      project: activeProjectScope(userId),
    },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { project: { select: { id: true, name: true } } },
  });
}

export async function getContactPerformance(userId: string) {
  const completed = await prisma.task.findMany({
    where: {
      status: { in: ["RECEIVED", "COMPLETED", "APPROVED"] },
      requestedDate: { not: null },
      completedDate: { not: null },
      contactId: { not: null },
      project: { ownerId: userId },
    },
    include: { contact: { select: { role: true, companyName: true } } },
  });

  const byRole = new Map<string, { total: number; count: number }>();
  for (const t of completed) {
    if (!t.contact || !t.requestedDate || !t.completedDate) continue;
    const days = differenceInCalendarDays(t.completedDate, t.requestedDate);
    if (days < 0) continue;
    const agg = byRole.get(t.contact.role) ?? { total: 0, count: 0 };
    agg.total += days;
    agg.count += 1;
    byRole.set(t.contact.role, agg);
  }

  return [...byRole.entries()].map(([role, { total, count }]) => ({
    role,
    avgDays: Math.round(total / count),
    samples: count,
  }));
}
