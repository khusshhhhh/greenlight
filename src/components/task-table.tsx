"use client";

import * as React from "react";
import { Pencil, Plus, Lock, CornerDownRight, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatusBadge } from "@/components/status-badge";
import { TaskEditDialog } from "@/components/task-edit-dialog";
import { setTaskStatus, bulkSetTaskStatus, addTaskVariation } from "@/lib/actions";
import { toast } from "@/components/ui/toast";
import { taskTone, isTaskDone } from "@/lib/business";
import { fmtDate, daysRemainingLabel } from "@/lib/dates";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@prisma/client";
import type { TaskWithRelations, ContactOption } from "@/lib/client-types";

type AnyTask = TaskWithRelations | TaskWithRelations["variations"][number];

export function TaskTable({
  tasks,
  contacts,
  doneIds,
}: {
  tasks: TaskWithRelations[];
  contacts: ContactOption[];
  /** ids of tasks that are done — used to compute dependency locks */
  doneIds: string[];
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [editing, setEditing] = React.useState<AnyTask | null>(null);
  const [bulkPending, startBulkTransition] = React.useTransition();
  const doneSet = React.useMemo(() => new Set(doneIds), [doneIds]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function applyBulk(status: TaskStatus) {
    const n = selected.size;
    startBulkTransition(() => {
      bulkSetTaskStatus([...selected], status).then(() => {
        setSelected(new Set());
        toast.success(`${n} task${n === 1 ? "" : "s"} updated`);
      });
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <span className="text-muted-foreground">Set status:</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm disabled:cursor-wait disabled:opacity-60"
            defaultValue=""
            disabled={bulkPending}
            onChange={(e) => {
              if (e.target.value) applyBulk(e.target.value as TaskStatus);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Choose…
            </option>
            {TASK_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          {bulkPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button size="sm" variant="ghost" disabled={bulkPending} onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Task</TableHead>
              <TableHead className="hidden md:table-cell">Responsible</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Requested</TableHead>
              <TableHead className="hidden lg:table-cell">Due</TableHead>
              <TableHead className="hidden xl:table-cell">Completed</TableHead>
              <TableHead>Days</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const deps = (task.dependencyTaskIds as string[] | null) ?? [];
              const locked = deps.length > 0 && !deps.every((d) => doneSet.has(d));
              return (
                <React.Fragment key={task.id}>
                  <Row
                    task={task}
                    locked={locked}
                    selected={selected.has(task.id)}
                    onToggle={() => toggle(task.id)}
                    onEdit={() => setEditing(task)}
                  />
                  {task.variations.map((v) => (
                    <Row
                      key={v.id}
                      task={v}
                      variation
                      selected={selected.has(v.id)}
                      onToggle={() => toggle(v.id)}
                      onEdit={() => setEditing(v)}
                    />
                  ))}
                  {task.isRepeatable && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell />
                      <TableCell colSpan={8}>
                        <AddVariationButton parentId={task.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TaskEditDialog
        task={editing}
        contacts={contacts}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
      />
    </div>
  );
}

function Row({
  task,
  selected,
  onToggle,
  onEdit,
  locked,
  variation,
}: {
  task: AnyTask;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  locked?: boolean;
  variation?: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [optimisticStatus, setOptimisticStatus] = React.useState<TaskStatus | null>(null);
  const displayStatus = pending && optimisticStatus ? optimisticStatus : task.status;
  const overdueLabel = daysRemainingLabel(task.dueDate);
  const done = isTaskDone(displayStatus);

  return (
    <TableRow className={cn(locked && "opacity-60")}>
      <TableCell>
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label="Select task" />
      </TableCell>
      <TableCell>
        <div className={cn("flex items-start gap-1.5", variation && "pl-4")}>
          {variation && <CornerDownRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn("font-medium", done && "text-muted-foreground line-through")}>
                {task.title}
              </span>
              {locked && (
                <span
                  title="Waiting on dependencies"
                  className="inline-flex items-center gap-0.5 rounded bg-muted px-1 text-[10px] text-muted-foreground"
                >
                  <Lock className="h-3 w-3" /> locked
                </span>
              )}
            </div>
            {task.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
        {task.responsibleParty ?? "—"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={pending}>
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 disabled:cursor-wait"
              aria-label="Change status"
            >
              <TaskStatusBadge
                status={displayStatus}
                tone={taskTone({ ...task, status: displayStatus })}
                className={cn(pending && "opacity-70")}
              />
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TASK_STATUS_ORDER.map((s) => (
              <DropdownMenuItem
                key={s}
                onSelect={() => {
                  setOptimisticStatus(s);
                  startTransition(() => {
                    setTaskStatus(task.id, s)
                      .then(() => toast.success("Status changed"))
                      .catch(() => {
                        setOptimisticStatus(null);
                        toast.error("Couldn't update status");
                      });
                  });
                }}
              >
                <TaskStatusBadge status={s} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
        {fmtDate(task.requestedDate)}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
        {fmtDate(task.dueDate)}
      </TableCell>
      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
        {fmtDate(task.completedDate)}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "text-xs font-medium",
            overdueLabel.includes("overdue") && !done
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
          )}
        >
          {done ? "—" : overdueLabel}
        </span>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function AddVariationButton({ parentId }: { parentId: string }) {
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-muted-foreground"
      onClick={() =>
        startTransition(() =>
          addTaskVariation(parentId).then(() => toast.success("Variation added"))
        )
      }
    >
      <Plus className="h-4 w-4" /> Add variation
    </Button>
  );
}
