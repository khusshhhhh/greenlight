import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { SettingsClient } from "@/components/settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [councils, durations] = await Promise.all([
    prisma.council.findMany({ where: { ownerId: userId }, orderBy: { name: "asc" } }),
    prisma.taskDurationSetting.findMany({ where: { ownerId: userId }, orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage councils, contact roles, default task durations and appearance."
      />
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
