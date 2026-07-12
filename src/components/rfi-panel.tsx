"use client";

import * as React from "react";
import { Plus, Pencil, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RfiStatusBadge } from "@/components/status-badge";
import { createRfi, updateRfi } from "@/lib/actions";
import { fmtDate, toInputDate, daysRemainingLabel } from "@/lib/dates";
import {
  RFI_STATUS_LABEL,
  WORKFLOW_LABEL,
  WORKFLOW_SHORT,
  enumOptions,
} from "@/lib/constants";
import type { RFIStatus, WorkflowType } from "@prisma/client";
import type { RfiWithRelations, ContactOption } from "@/lib/client-types";

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => (
  <select
    ref={ref}
    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    {...props}
  />
));
NativeSelect.displayName = "NativeSelect";

export function RfiPanel({
  projectId,
  rfis,
  contacts,
}: {
  projectId: string;
  rfis: RfiWithRelations[];
  contacts: ContactOption[];
}) {
  const [editing, setEditing] = React.useState<RfiWithRelations | null>(null);
  const [creating, setCreating] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileWarning className="h-4 w-4" /> RFIs ({rfis.length})
        </CardTitle>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Add RFI
            </Button>
          </DialogTrigger>
          <RfiDialog
            projectId={projectId}
            contacts={contacts}
            onDone={() => setCreating(false)}
          />
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {rfis.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No RFIs raised yet.</p>
        ) : (
          <div className="divide-y">
            {rfis.map((rfi) => (
              <div key={rfi.id} className="flex items-start justify-between gap-3 px-6 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
                      {WORKFLOW_SHORT[rfi.workflowType]} RFI {rfi.rfiNumber}
                    </span>
                    <RfiStatusBadge status={rfi.status} />
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{rfi.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {rfi.receivedFrom ? `From ${rfi.receivedFrom} · ` : ""}
                    Received {fmtDate(rfi.dateReceived)}
                    {rfi.dueDate ? ` · Due ${fmtDate(rfi.dueDate)} (${daysRemainingLabel(rfi.dueDate)})` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setEditing(rfi)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {editing && (
        <Dialog open onOpenChange={(v) => !v && setEditing(null)}>
          <RfiDialog
            projectId={projectId}
            contacts={contacts}
            rfi={editing}
            onDone={() => setEditing(null)}
          />
        </Dialog>
      )}
    </Card>
  );
}

function RfiDialog({
  projectId,
  contacts,
  rfi,
  onDone,
}: {
  projectId: string;
  contacts: ContactOption[];
  rfi?: RfiWithRelations;
  onDone: () => void;
}) {
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (rfi) await updateRfi(rfi.id, fd);
      else await createRfi(projectId, fd);
      onDone();
    } finally {
      setPending(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{rfi ? `Edit RFI ${rfi.rfiNumber}` : "New RFI"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block">Workflow</Label>
            <NativeSelect name="workflowType" defaultValue={rfi?.workflowType ?? "PLANNING"} disabled={!!rfi}>
              {(Object.keys(WORKFLOW_LABEL) as WorkflowType[]).map((w) => (
                <option key={w} value={w}>
                  {WORKFLOW_LABEL[w]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <NativeSelect name="status" defaultValue={rfi?.status ?? "OPEN"}>
              {enumOptions<RFIStatus>(RFI_STATUS_LABEL).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Title</Label>
          <Input name="title" defaultValue={rfi?.title ?? ""} required />
        </div>
        <div>
          <Label className="mb-1.5 block">Description</Label>
          <Textarea name="description" defaultValue={rfi?.description ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block">Received from</Label>
            <Input name="receivedFrom" defaultValue={rfi?.receivedFrom ?? "Council"} />
          </div>
          <div>
            <Label className="mb-1.5 block">Sent to (contact)</Label>
            <NativeSelect name="responsibleContactId" defaultValue={rfi?.responsibleContactId ?? ""}>
              <option value="">— None —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label className="mb-1.5 block">Date received</Label>
            <Input type="date" name="dateReceived" defaultValue={toInputDate(rfi?.dateReceived)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Response due</Label>
            <Input type="date" name="dueDate" defaultValue={toInputDate(rfi?.dueDate)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Response received</Label>
            <Input
              type="date"
              name="responseReceivedDate"
              defaultValue={toInputDate(rfi?.responseReceivedDate)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Submitted to council</Label>
            <Input type="date" name="submittedDate" defaultValue={toInputDate(rfi?.submittedDate)} />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Notes</Label>
          <Textarea name="notes" defaultValue={rfi?.notes ?? ""} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : rfi ? "Save RFI" : "Create RFI"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
