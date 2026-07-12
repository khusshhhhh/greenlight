import type { Task, TaskStatus } from "@prisma/client";
import {
  COMPLETED_TASK_STATUSES,
  TASK_STATUS_TONE,
  type Tone,
} from "./constants";
import { daysRemaining } from "./dates";

export function isTaskDone(status: TaskStatus): boolean {
  return COMPLETED_TASK_STATUSES.includes(status);
}

export function isTaskOpen(status: TaskStatus): boolean {
  return !isTaskDone(status) && status !== "CANCELLED";
}

/**
 * A task is overdue when it has a due date in the past and is not yet done.
 */
export function isTaskOverdue(task: Pick<Task, "dueDate" | "status">): boolean {
  if (isTaskDone(task.status) || task.status === "CANCELLED") return false;
  const n = daysRemaining(task.dueDate);
  return n != null && n < 0;
}

export function isTaskDueSoon(
  task: Pick<Task, "dueDate" | "status">,
  withinDays = 7
): boolean {
  if (!isTaskOpen(task.status)) return false;
  const n = daysRemaining(task.dueDate);
  return n != null && n >= 0 && n <= withinDays;
}

/**
 * Resolve the colour tone for a task, layering the overdue / due-soon signals
 * on top of the base status tone. This is the automatic colour-coding rule:
 *   green  = completed / approved
 *   red    = overdue or RFI received
 *   amber  = waiting / due soon
 *   grey   = not started
 */
export function taskTone(task: Pick<Task, "dueDate" | "status">): Tone {
  if (isTaskDone(task.status)) return "green";
  if (task.status === "RFI_RECEIVED") return "red";
  if (isTaskOverdue(task)) return "red";
  if (isTaskDueSoon(task)) return "amber";
  return TASK_STATUS_TONE[task.status];
}

/** Project progress 0–100 based on completed vs. actionable tasks. */
export function projectProgress(tasks: Pick<Task, "status">[]): number {
  const actionable = tasks.filter((t) => t.status !== "CANCELLED");
  if (actionable.length === 0) return 0;
  const done = actionable.filter((t) => isTaskDone(t.status)).length;
  return Math.round((done / actionable.length) * 100);
}

/**
 * Whether all dependency tasks are done. Used to "lock" tasks that are not
 * ready (e.g. Development tasks before Planning Approval is received).
 */
export function dependenciesMet(
  task: Pick<Task, "dependencyTaskIds">,
  byId: Map<string, Pick<Task, "status">>
): boolean {
  const deps = (task.dependencyTaskIds as string[] | null) ?? [];
  if (deps.length === 0) return true;
  return deps.every((id) => {
    const dep = byId.get(id);
    return dep ? isTaskDone(dep.status) : true;
  });
}

/** Missing (not-yet-done) required tasks, by title, for a lodgement gate. */
export function missingRequirements(
  requiredTemplateKeys: string[],
  tasks: Pick<Task, "templateKey" | "status" | "title">[]
): string[] {
  return requiredTemplateKeys
    .map((key) => tasks.find((t) => t.templateKey === key))
    .filter((t): t is Pick<Task, "templateKey" | "status" | "title"> => !!t)
    .filter((t) => !isTaskDone(t.status))
    .map((t) => t.title);
}

/** Required document/task gates for the two lodgement milestones. */
export const PLANNING_LODGEMENT_REQUIREMENTS = ["planning-drawings", "sd-plan"];
export const BRC_LODGEMENT_REQUIREMENTS = [
  "working-drawings",
  "energy-rating",
  "footing-report",
  "take-offs",
  "citb-levy",
];
