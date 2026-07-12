import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WORKFLOW_LABEL } from "@/lib/constants";
import { projectProgress } from "@/lib/business";
import type { Task, WorkflowType } from "@prisma/client";

export function ProgressSummary({
  tasksByWorkflow,
}: {
  tasksByWorkflow: { type: WorkflowType; tasks: Pick<Task, "status">[] }[];
}) {
  const overall = projectProgress(tasksByWorkflow.flatMap((w) => w.tasks));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">Overall</span>
            <span className="font-semibold">{overall}%</span>
          </div>
          <Progress value={overall} indicatorClassName="bg-emerald-500" className="h-2.5" />
        </div>
        {tasksByWorkflow.map((w) => {
          const p = projectProgress(w.tasks);
          return (
            <div key={w.type}>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{WORKFLOW_LABEL[w.type]}</span>
                <span>{p}%</span>
              </div>
              <Progress value={p} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
