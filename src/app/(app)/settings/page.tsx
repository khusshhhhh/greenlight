import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { SettingsClient } from "@/components/settings-client";
import { AccountSettings } from "@/components/account-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [user, councils, durations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, notificationsEnabled: true },
    }),
    prisma.council.findMany({ where: { ownerId: userId }, orderBy: { name: "asc" } }),
    prisma.taskDurationSetting.findMany({ where: { ownerId: userId }, orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications, councils and default task durations."
      />

      {user && (
        <div className="mb-6">
          <AccountSettings
            name={user.name}
            email={user.email}
            image={user.image}
            notificationsEnabled={user.notificationsEnabled}
          />
        </div>
      )}

      <SettingsClient
        councils={councils}
        durations={durations.map((d) => ({
          id: d.id,
          label: d.label,
          estimatedDays: d.estimatedDays,
          workflowType: d.workflowType,
        }))}
      />
    </div>
  );
}
