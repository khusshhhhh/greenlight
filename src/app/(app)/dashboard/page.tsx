import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  getDashboardStats,
  getOverdueTasks,
  getUpcomingTasks,
  getContactPerformance,
} from "@/lib/queries";
import { DashboardStats } from "@/components/dashboard-stats";
import { OverdueTasks, UpcomingTasks } from "@/components/overdue-tasks";
import { WorkflowStatusChart, type StatusDatum } from "@/components/workflow-status-chart";
import { ContactPerformance } from "@/components/contact-performance";
import { PageHeader } from "@/components/page-header";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  TASK_STATUS_TONE,
  TONE_DOT,
} from "@/lib/constants";
import type { TaskStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const TONE_HEX: Record<string, string> = {
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  grey: "#94a3b8",
  blue: "#3b82f6",
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [stats, overdue, upcoming, performance, grouped] = await Promise.all([
    getDashboardStats(userId),
    getOverdueTasks(userId, 8),
    getUpcomingTasks(userId, 8),
    getContactPerformance(userId),
    prisma.task.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { project: { ownerId: userId, status: { notIn: ["ARCHIVED", "CANCELLED"] } } },
    }),
  ]);

  const countByStatus = new Map(grouped.map((g) => [g.status, g._count._all]));
  const chartData: StatusDatum[] = TASK_STATUS_ORDER.filter(
    (s) => (countByStatus.get(s as TaskStatus) ?? 0) > 0
  ).map((s) => ({
    label: TASK_STATUS_LABEL[s],
    count: countByStatus.get(s) ?? 0,
    color: TONE_HEX[TASK_STATUS_TONE[s]],
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of every residential approval project."
      />

      <DashboardStats stats={stats} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WorkflowStatusChart data={chartData} />
        </div>
        <ContactPerformance data={performance} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverdueTasks tasks={overdue} />
        <UpcomingTasks tasks={upcoming} />
      </div>
    </div>
  );
}
