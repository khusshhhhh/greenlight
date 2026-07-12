import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKFLOW_LABEL, TONE_DOT } from "@/lib/constants";
import { taskTone, isTaskDone } from "@/lib/business";
import { fmtDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Task, WorkflowType } from "@prisma/client";

/** Visual vertical timeline of milestone tasks per workflow. */
export function WorkflowTimeline({
  workflows,
}: {
  workflows: { type: WorkflowType; tasks: Task[] }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Project timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {workflows.map((wf) => (
          <div key={wf.type}>
            <h4 className="mb-3 text-sm font-semibold">{WORKFLOW_LABEL[wf.type]}</h4>
            <ol className="relative ml-2 border-l pl-6">
              {wf.tasks.map((t) => {
                const tone = taskTone(t);
                return (
                  <li key={t.id} className="relative pb-4 last:pb-0">
                    <span
                      className={cn(
                        "absolute -left-[1.72rem] top-1 h-3 w-3 rounded-full ring-4 ring-background",
                        TONE_DOT[tone]
                      )}
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isTaskDone(t.status) && "text-muted-foreground"
                        )}
                      >
                        {t.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.completedDate
                          ? `Done ${fmtDate(t.completedDate)}`
                          : t.dueDate
                          ? `Due ${fmtDate(t.dueDate)}`
                          : ""}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
