import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_ROLE_LABEL } from "@/lib/constants";
import { Gauge } from "lucide-react";
import type { ContactRole } from "@prisma/client";

export function ContactPerformance({
  data,
}: {
  data: { role: string; avgDays: number; samples: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4" /> Consultant performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No completed consultant tasks yet. Averages appear once tasks are received.
          </p>
        )}
        {data.map((d) => (
          <div key={d.role} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {CONTACT_ROLE_LABEL[d.role as ContactRole] ?? d.role}
            </span>
            <span className="font-medium">
              {d.avgDays}d avg{" "}
              <span className="text-xs text-muted-foreground">({d.samples})</span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
