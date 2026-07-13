import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsExplorer } from "@/components/projects-explorer";
import type { ProjectCardData } from "@/components/project-card";
import { isTaskOverdue, projectProgress } from "@/lib/business";
import { OPEN_RFI_STATUSES, SA_COUNCILS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const userId = await requireUserId();

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: { select: { status: true, dueDate: true } },
      rfis: { select: { status: true } },
    },
  });

  const cards: ProjectCardData[] = projects.map((p) => ({
    ...p,
    _overdue: p.tasks.filter(isTaskOverdue).length,
    _openRfis: p.rfis.filter((r) => OPEN_RFI_STATUSES.includes(r.status)).length,
    _progress: projectProgress(p.tasks),
  }));

  const councils = [
    ...new Set([
      ...SA_COUNCILS,
      ...(projects.map((p) => p.council).filter(Boolean) as string[]),
    ]),
  ].sort();

  return (
    <div>
      <PageHeader title="Projects" description="Search, filter and sort all your projects.">
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4" /> New Project
          </Link>
        </Button>
      </PageHeader>

      <ProjectsExplorer
        projects={cards}
        councils={councils}
        initialQuery={searchParams.q ?? ""}
      />
    </div>
  );
}
