import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProjectDetail } from "@/lib/project-data";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { SA_COUNCILS, WORKFLOW_LABEL } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSummaryCard } from "@/components/project-summary-card";
import { ProgressSummary } from "@/components/progress-summary";
import { MissingDocsPanel } from "@/components/missing-docs-panel";
import { ContactAssignmentPanel } from "@/components/contact-assignment-panel";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { TaskTable } from "@/components/task-table";
import { RfiPanel } from "@/components/rfi-panel";
import { DocumentList } from "@/components/document-list";
import { NotesPanel } from "@/components/notes-panel";
import { ActivityFeed } from "@/components/activity-feed";
import { KanbanBoard } from "@/components/kanban-board";
import { ProjectActions } from "@/components/project-actions";
import { ProjectStatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const data = await getProjectDetail(params.id, userId);
  if (!data) notFound();

  const { project, tasks, byWorkflow, flatTasks, doneIds, contacts } = data;
  const councilRows = await prisma.council.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });
  const councils = [...new Set([...councilRows.map((c) => c.name), ...SA_COUNCILS])].sort();

  const TabWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="min-w-0 overflow-x-auto">{children}</div>
  );

  return (
    <div>
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> All projects
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            {project.council && (
              <span className="text-sm text-muted-foreground">{project.council}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProjectActions project={project} councils={councils} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Main column */}
        <div className="min-w-0">
          <Tabs defaultValue="overview">
            <TabsList className="w-full max-w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="development">BRC</TabsTrigger>
              <TabsTrigger value="land">Land Division</TabsTrigger>
              <TabsTrigger value="kanban">Board</TabsTrigger>
              <TabsTrigger value="rfis">RFIs</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <WorkflowTimeline workflows={byWorkflow} />
            </TabsContent>

            {(["PLANNING", "DEVELOPMENT", "LAND_DIVISION"] as const).map((type, i) => {
              const value = ["planning", "development", "land"][i];
              const wf = byWorkflow.find((w) => w.type === type)!;
              return (
                <TabsContent key={type} value={value}>
                  <h2 className="mb-3 text-lg font-semibold">{WORKFLOW_LABEL[type]}</h2>
                  <TabWrap>
                    <TaskTable tasks={wf.tasks} contacts={contacts} doneIds={doneIds} />
                  </TabWrap>
                </TabsContent>
              );
            })}

            <TabsContent value="kanban">
              <KanbanBoard tasks={flatTasks} />
            </TabsContent>

            <TabsContent value="rfis">
              <RfiPanel projectId={project.id} rfis={project.rfis} contacts={contacts} />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentList projectId={project.id} documents={project.documents} />
            </TabsContent>

            <TabsContent value="notes">
              <NotesPanel projectId={project.id} notes={project.notes_list} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityFeed activities={project.activities} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProjectSummaryCard project={project} />
          <ProgressSummary
            tasksByWorkflow={byWorkflow.map((w) => ({ type: w.type, tasks: w.tasks }))}
          />
          <MissingDocsPanel tasks={tasks} />
          <ContactAssignmentPanel
            projectId={project.id}
            assigned={project.projectContacts}
            allContacts={contacts}
          />
        </div>
      </div>
    </div>
  );
}
