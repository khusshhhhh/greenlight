import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/billing";
import { getNotifications } from "@/lib/queries";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { IdleTimeout } from "@/components/idle-timeout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch account + notifications in parallel to shave a round-trip.
  const [user, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        notificationsEnabled: true,
        stripeStatus: true,
        stripeCurrentPeriodEnd: true,
      },
    }),
    getNotifications(session.user.id),
  ]);
  if (!user || !isSubscriptionActive(user)) redirect("/billing");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={{ name: user.name, email: user.email, image: user.image }}
          notifications={notifications}
          notificationsEnabled={user.notificationsEnabled}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <IdleTimeout />
    </div>
  );
}
