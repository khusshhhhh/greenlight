"use client";

import * as React from "react";
import { updateTask } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  CONTACT_ROLE_LABEL,
} from "@/lib/constants";
import { toInputDate } from "@/lib/dates";
import type { TaskWithRelations, ContactOption } from "@/lib/client-types";

export function TaskEditDialog({
  task,
  contacts,
  open,
  onOpenChange,
}: {
  task: (TaskWithRelations | (TaskWithRelations["variations"][number])) | null;
  contacts: ContactOption[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pending, setPending] = React.useState(false);
  if (!task) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateTask(task!.id, fd);
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Title</Label>
            <Input name="title" defaultValue={task.title} required />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea name="description" defaultValue={task.description ?? ""} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Status</Label>
              <Select name="status" defaultValue={task.status}>
                {TASK_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Responsible party</Label>
              <Input name="responsibleParty" defaultValue={task.responsibleParty ?? ""} />
            </div>
            <div>
              <Label className="mb-1.5 block">Linked contact</Label>
              <Select name="contactId" defaultValue={task.contactId ?? ""}>
                <option value="">— None —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({CONTACT_ROLE_LABEL[c.role]})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Requested date</Label>
              <Input type="date" name="requestedDate" defaultValue={toInputDate(task.requestedDate)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Estimated days</Label>
              <Input
                type="number"
                name="estimatedDays"
                min={0}
                defaultValue={task.estimatedDays ?? ""}
                placeholder="Auto-calculates due date"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Due date (override)</Label>
              <Input type="date" name="dueDate" defaultValue={toInputDate(task.dueDate)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Completed / received date</Label>
              <Input type="date" name="completedDate" defaultValue={toInputDate(task.completedDate)} />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Notes</Label>
            <Textarea name="notes" defaultValue={task.notes ?? ""} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => (
  <select
    ref={ref}
    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    {...props}
  />
));
Select.displayName = "Select";
