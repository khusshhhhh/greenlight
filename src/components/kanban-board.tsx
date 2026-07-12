"use client";

import * as React from "react";
import { setTaskStatus } from "@/lib/actions";
import { KANBAN_COLUMNS, TASK_STATUS_LABEL, TONE_DOT, TASK_STATUS_TONE } from "@/lib/constants";
import { taskTone } from "@/lib/business";
import { fmtDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import type { TaskStatus } from "@prisma/client";
import type { TaskWithRelations } from "@/lib/client-types";

type FlatTask = TaskWithRelations | TaskWithRelations["variations"][number];

export function KanbanBoard({ tasks }: { tasks: FlatTask[] }) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<TaskStatus | null>(null);
  const [, startTransition] = React.useTransition();

  function onDrop(status: TaskStatus) {
    if (dragId) startTransition(() => setTaskStatus(dragId, status));
    setDragId(null);
    setOver(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col);
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col);
            }}
            onDragLeave={() => setOver((c) => (c === col ? null : c))}
            onDrop={() => onDrop(col)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
              over === col && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("h-2 w-2 rounded-full", TONE_DOT[TASK_STATUS_TONE[col]])} />
                {TASK_STATUS_LABEL[col]}
              </span>
              <span className="rounded-full bg-background px-2 text-xs text-muted-foreground">
                {colTasks.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {colTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group cursor-grab rounded-lg border bg-card p-3 shadow-sm active:cursor-grabbing",
                    dragId === t.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{t.title}</p>
                      {t.responsibleParty && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.responsibleParty}</p>
                      )}
                      {t.dueDate && (
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            taskTone(t) === "red"
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                          )}
                        >
                          Due {fmtDate(t.dueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
