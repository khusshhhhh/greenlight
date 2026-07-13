import Link from "next/link";
import { MapPin, User, Landmark, AlertTriangle, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge } from "@/components/status-badge";
import { projectProgress } from "@/lib/business";
import type { Project, Task, RFI } from "@prisma/client";

export type ProjectCardData = Project & {
  tasks: Pick<Task, "status">[];
  rfis: Pick<RFI, "status">[];
  _overdue?: number;
  _openRfis?: number;
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const progress = projectProgress(project.tasks);
  const overdue = project._overdue ?? 0;
  const openRfis = project._openRfis ?? 0;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <h3 className="font-semibold leading-tight group-hover:text-primary">
            {project.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ProjectStatusBadge status={project.status} />
            {overdue > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" /> {overdue} overdue
              </span>
            )}
            {openRfis > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <FileWarning className="h-3.5 w-3.5" /> {openRfis} RFI
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {project.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{project.address}</span>
            </div>
          )}
          {project.clientName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{project.clientName}</span>
            </div>
          )}
          {project.council && (
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 shrink-0" />
              <span className="truncate">{project.council}</span>
            </div>
          )}
          <div className="pt-1">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} indicatorClassName="bg-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
