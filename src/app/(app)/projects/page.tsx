import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ProjectFilters } from "@/components/project-filters";
import { ProjectCard, type ProjectCardData } from "@/components/project-card";
import { isTaskOverdue } from "@/lib/business";
import { OPEN_RFI_STATUSES, SA_COUNCILS } from "@/lib/constants";
import type { Prisma, ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; council?: string; flag?: string };
}) {
  const userId = await requireUserId();
  const where: Prisma.ProjectWhereInput = { ownerId: userId };
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { address: { contains: searchParams.q, mode: "insensitive" } },
      { clientName: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.status) where.status = searchParams.status as ProjectStatus;
  if (searchParams.council) where.council = searchParams.council;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: { select: { status: true, dueDate: true } },
      rfis: { select: { status: true } },
    },
  });

  const councils = [
    ...new Set([...SA_COUNCILS, ...(projects.map((p) => p.council).filter(Boolean) as string[])]),
  ].sort();

  let cards: ProjectCardData[] = projects.map((p) => ({
    ...p,
    _overdue: p.tasks.filter(isTaskOverdue).length,
    _openRfis: p.rfis.filter((r) => OPEN_RFI_STATUSES.includes(r.status)).length,
  }));

  if (searchParams.flag === "overdue") cards = cards.filter((c) => (c._overdue ?? 0) > 0);
  if (searchParams.flag === "rfi") cards = cards.filter((c) => (c._openRfis ?? 0) > 0);

  return (
    <div>
      <PageHeader title="Projects" description={`${cards.length} project${cards.length === 1 ? "" : "s"}`}>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4" /> New Project
          </Link>
        </Button>
      </PageHeader>

      <ProjectFilters councils={councils} />

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <p>No projects match your filters.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/projects/new">Create your first project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
