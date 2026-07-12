import { cn } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  PRIORITY_TONE,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_TONE,
  RFI_STATUS_LABEL,
  RFI_STATUS_TONE,
  TASK_STATUS_LABEL,
  TASK_STATUS_TONE,
  TONE_BADGE,
  TONE_DOT,
  type Tone,
} from "@/lib/constants";
import type {
  Priority,
  ProjectStatus,
  RFIStatus,
  TaskStatus,
} from "@prisma/client";

export function ToneBadge({
  tone,
  label,
  className,
  dot = true,
}: {
  tone: Tone;
  label: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_BADGE[tone],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />}
      {label}
    </span>
  );
}

/** Task status badge — tone can be overridden to reflect overdue/due-soon. */
export function TaskStatusBadge({
  status,
  tone,
  className,
}: {
  status: TaskStatus;
  tone?: Tone;
  className?: string;
}) {
  return (
    <ToneBadge
      tone={tone ?? TASK_STATUS_TONE[status]}
      label={TASK_STATUS_LABEL[status]}
      className={className}
    />
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <ToneBadge tone={PROJECT_STATUS_TONE[status]} label={PROJECT_STATUS_LABEL[status]} />;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <ToneBadge tone={PRIORITY_TONE[priority]} label={PRIORITY_LABEL[priority]} dot={false} />;
}

export function RfiStatusBadge({ status }: { status: RFIStatus }) {
  return <ToneBadge tone={RFI_STATUS_TONE[status]} label={RFI_STATUS_LABEL[status]} />;
}
