import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProjectDetail } from "@/lib/project-data";
import { requireUserId } from "@/lib/session";
import { WORKFLOW_LABEL } from "@/lib/constants";
import { TaskTable } from "@/components/task-table";
import { MissingDocsPanel } from "@/components/missing-docs-panel";
import type { WorkflowType } from "@prisma/client";

export async function WorkflowSubPage({ id, type }: { id: string; type: WorkflowType }) {
  const userId = await requireUserId();
  const data = await getProjectDetail(id, userId);
  if (!data) notFound();
  const { project, byWorkflow, doneIds, contacts, tasks } = data;
  const wf = byWorkflow.find((w) => w.type === type)!;

  return (
    <div>
      <Link
        href={`/projects/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> {project.name}
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{WORKFLOW_LABEL[type]}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <TaskTable tasks={wf.tasks} contacts={contacts} doneIds={doneIds} />
        </div>
        {type !== "LAND_DIVISION" && (
          <div>
            <MissingDocsPanel tasks={tasks} />
          </div>
        )}
      </div>
    </div>
  );
}
