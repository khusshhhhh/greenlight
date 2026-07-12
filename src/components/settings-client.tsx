"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToneBadge } from "@/components/status-badge";
import { addCouncil, updateTaskDuration } from "@/lib/actions";
import { useTheme } from "next-themes";
import { CONTACT_ROLE_LABEL, WORKFLOW_LABEL } from "@/lib/constants";
import type { ContactRole, WorkflowType } from "@prisma/client";

interface Duration {
  id: string;
  label: string;
  estimatedDays: number;
  workflowType: WorkflowType;
}

export function SettingsClient({
  councils,
  durations,
}: {
  councils: { id: string; name: string; region: string | null }[];
  durations: Duration[];
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [pending, setPending] = React.useState(false);

  const byWorkflow = (["PLANNING", "DEVELOPMENT", "LAND_DIVISION"] as WorkflowType[]).map(
    (w) => ({ type: w, items: durations.filter((d) => d.workflowType === w) })
  );

  async function onAddCouncil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addCouncil(fd);
      (e.target as HTMLFormElement).reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            Currently: {resolvedTheme}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default task durations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Editing a duration changes the auto-calculated due dates for tasks created in{" "}
            <em>new</em> projects.
          </p>
          {byWorkflow.map((wf) => (
            <div key={wf.type}>
              <h4 className="mb-2 text-sm font-semibold">{WORKFLOW_LABEL[wf.type]}</h4>
              <div className="space-y-1.5">
                {wf.items.map((d) => (
                  <DurationRow key={d.id} duration={d} />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Councils</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onAddCouncil} className="flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <Label className="mb-1.5 block">Council name</Label>
              <Input name="name" required placeholder="City of …" />
            </div>
            <div className="flex-1">
              <Label className="mb-1.5 block">Region (optional)</Label>
              <Input name="region" placeholder="Metropolitan Adelaide" />
            </div>
            <Button type="submit" disabled={pending}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {councils.map((c) => (
              <ToneBadge key={c.id} tone="grey" label={c.name} dot={false} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact roles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(Object.keys(CONTACT_ROLE_LABEL) as ContactRole[]).map((r) => (
            <ToneBadge key={r} tone="blue" label={CONTACT_ROLE_LABEL[r]} dot={false} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DurationRow({ duration }: { duration: Duration }) {
  const [days, setDays] = React.useState(duration.estimatedDays);
  const [pending, startTransition] = React.useTransition();
  const dirty = days !== duration.estimatedDays;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <span className="text-sm">{duration.label}</span>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-8 w-20"
        />
        <span className="text-xs text-muted-foreground">days</span>
        {dirty && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => updateTaskDuration(duration.id, days))}
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
