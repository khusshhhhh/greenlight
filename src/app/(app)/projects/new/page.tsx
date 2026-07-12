import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { createProject } from "@/lib/actions";
import { ProjectForm } from "@/components/project-form";
import { PageHeader } from "@/components/page-header";
import { SA_COUNCILS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const userId = await requireUserId();
  const councilRows = await prisma.council.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });
  const councils = [...new Set([...councilRows.map((c) => c.name), ...SA_COUNCILS])].sort();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New project"
        description="Default Planning, Development / BRC and Land Division workflows are created automatically."
      />
      <ProjectForm councils={councils} action={createProject} />
    </div>
  );
}
