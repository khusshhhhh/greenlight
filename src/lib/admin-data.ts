import { prisma } from "./prisma";
import { isSubscriptionActive } from "./billing";
import { OPEN_RFI_STATUSES } from "./constants";
import { subDays } from "date-fns";

/**
 * App-wide aggregate metrics for the admin dashboard.
 *
 * PRIVACY: deliberately returns only counts and account-level info. It never
 * returns project names, addresses, client details, tasks, notes or documents.
 */
export async function getAdminStats() {
  const [
    totalUsers,
    totalProjects,
    totalTasks,
    openRfis,
    totalContacts,
    projectsByStatus,
    completedTasks,
    newUsers30,
    users,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.rFI.count({ where: { status: { in: OPEN_RFI_STATUSES } } }),
    prisma.contact.count(),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.task.count({ where: { status: { in: ["COMPLETED", "APPROVED", "RECEIVED"] } } }),
    prisma.user.count({ where: { createdAt: { gte: subDays(new Date(), 30) } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        stripeStatus: true,
        stripeCurrentPeriodEnd: true,
        _count: { select: { ownedProjects: true, contacts: true } },
      },
    }),
  ]);

  const overdueTasks = await prisma.task.count({
    where: {
      dueDate: { lt: new Date() },
      status: { notIn: ["COMPLETED", "APPROVED", "RECEIVED", "CANCELLED"] },
    },
  });

  const activeSubscribers = users.filter((u) =>
    isSubscriptionActive({
      stripeStatus: u.stripeStatus,
      stripeCurrentPeriodEnd: u.stripeCurrentPeriodEnd,
    })
  ).length;

  const perStatus = projectsByStatus.map((p) => ({
    status: p.status,
    count: p._count._all,
  }));

  // Account rows — identity + counts only, never project contents.
  const accounts = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    joined: u.createdAt,
    projects: u._count.ownedProjects,
    contacts: u._count.contacts,
    subscribed: isSubscriptionActive({
      stripeStatus: u.stripeStatus,
      stripeCurrentPeriodEnd: u.stripeCurrentPeriodEnd,
    }),
  }));

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalUsers,
    totalProjects,
    totalTasks,
    openRfis,
    overdueTasks,
    totalContacts,
    activeSubscribers,
    newUsers30,
    completionRate,
    perStatus,
    accounts,
  };
}
