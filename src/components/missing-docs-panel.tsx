import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BRC_LODGEMENT_REQUIREMENTS,
  PLANNING_LODGEMENT_REQUIREMENTS,
  missingRequirements,
} from "@/lib/business";
import type { Task } from "@prisma/client";

function Gate({
  title,
  missing,
}: {
  title: string;
  missing: string[];
}) {
  const ready = missing.length === 0;
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {ready ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        {title}
      </div>
      {ready ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          All prerequisites complete — ready to lodge.
        </p>
      ) : (
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MissingDocsPanel({ tasks }: { tasks: Task[] }) {
  const planningMissing = missingRequirements(PLANNING_LODGEMENT_REQUIREMENTS, tasks);
  const brcMissing = missingRequirements(BRC_LODGEMENT_REQUIREMENTS, tasks);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lodgement readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Gate title="Planning application lodgement" missing={planningMissing} />
        <Gate title="BRC application" missing={brcMissing} />
      </CardContent>
    </Card>
  );
}
