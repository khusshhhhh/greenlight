import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDateTime } from "@/lib/dates";
import { Activity } from "lucide-react";
import type { ActivityLog } from "@/lib/client-types";

export function ActivityFeed({ activities }: { activities: ActivityLog[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" /> Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="relative ml-1 border-l pl-5">
            {activities.map((a) => (
              <li key={a.id} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[1.42rem] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                <p className="text-sm font-medium">{a.action}</p>
                {(a.oldValue || a.newValue) && (
                  <p className="text-xs text-muted-foreground">
                    {a.oldValue ? `${a.oldValue} → ` : ""}
                    {a.newValue}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {a.createdBy ? `${a.createdBy} · ` : ""}
                  {fmtDateTime(a.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
