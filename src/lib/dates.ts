import { addDays, differenceInCalendarDays, format, isValid } from "date-fns";

export function fmtDate(date?: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "d MMM yyyy");
}

export function fmtDateTime(date?: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "d MMM yyyy, h:mm a");
}

export function toInputDate(date?: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

/** Auto-calculate a due date from a requested date + estimated days. */
export function calcDueDate(
  requestedDate?: Date | string | null,
  estimatedDays?: number | null
): Date | null {
  if (!requestedDate || estimatedDays == null) return null;
  const d = typeof requestedDate === "string" ? new Date(requestedDate) : requestedDate;
  if (!isValid(d)) return null;
  return addDays(d, estimatedDays);
}

/** Days remaining until due (negative = overdue). null if no due date. */
export function daysRemaining(dueDate?: Date | string | null): number | null {
  if (!dueDate) return null;
  const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (!isValid(d)) return null;
  return differenceInCalendarDays(d, new Date());
}

export function daysRemainingLabel(dueDate?: Date | string | null): string {
  const n = daysRemaining(dueDate);
  if (n == null) return "—";
  if (n < 0) return `${Math.abs(n)}d overdue`;
  if (n === 0) return "Due today";
  return `${n}d left`;
}
