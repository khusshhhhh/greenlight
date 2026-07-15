import type {
  ContactRole,
  DocumentType,
  Priority,
  ProjectStatus,
  RFIStatus,
  TaskStatus,
  WorkflowType,
} from "@prisma/client";

/** A colour "tone" used consistently across badges, dots and progress bars. */
export type Tone = "green" | "amber" | "red" | "grey" | "blue";

export const TONE_BADGE: Record<Tone, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25",
  amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25",
  red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25",
  grey: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/25",
  blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25",
};

export const TONE_DOT: Record<Tone, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  grey: "bg-slate-400",
  blue: "bg-blue-500",
};

// ---------------------------------------------------------------------------
// Task status
// ---------------------------------------------------------------------------

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  REQUESTED: "Requested",
  IN_PROGRESS: "In Progress",
  RECEIVED: "Received",
  LODGED: "Lodged",
  RFI_RECEIVED: "RFI Received",
  WAITING: "Waiting",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export const TASK_STATUS_TONE: Record<TaskStatus, Tone> = {
  NOT_STARTED: "grey",
  REQUESTED: "blue",
  IN_PROGRESS: "blue",
  RECEIVED: "green",
  LODGED: "blue",
  RFI_RECEIVED: "red",
  WAITING: "amber",
  APPROVED: "green",
  COMPLETED: "green",
  ON_HOLD: "amber",
  CANCELLED: "grey",
};

/** Statuses that count as "done" for progress calculation. */
export const COMPLETED_TASK_STATUSES: TaskStatus[] = [
  "RECEIVED",
  "APPROVED",
  "COMPLETED",
];

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "NOT_STARTED",
  "REQUESTED",
  "IN_PROGRESS",
  "WAITING",
  "RFI_RECEIVED",
  "LODGED",
  "RECEIVED",
  "APPROVED",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
];

/** Columns for the kanban board. */
export const KANBAN_COLUMNS: TaskStatus[] = [
  "NOT_STARTED",
  "REQUESTED",
  "IN_PROGRESS",
  "WAITING",
  "RFI_RECEIVED",
  "COMPLETED",
  "APPROVED",
];

// ---------------------------------------------------------------------------
// Project status
// ---------------------------------------------------------------------------

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
};

export const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
  DRAFT: "grey",
  ACTIVE: "blue",
  ON_HOLD: "amber",
  APPROVED: "green",
  COMPLETED: "green",
  ARCHIVED: "grey",
  CANCELLED: "grey",
};

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_TONE: Record<Priority, Tone> = {
  LOW: "grey",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "red",
};

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

export const WORKFLOW_LABEL: Record<WorkflowType, string> = {
  PLANNING: "Planning Approval",
  DEVELOPMENT: "Development Approval / BRC",
  LAND_DIVISION: "Land Division",
};

export const WORKFLOW_SHORT: Record<WorkflowType, string> = {
  PLANNING: "Planning",
  DEVELOPMENT: "BRC",
  LAND_DIVISION: "Land Division",
};

// ---------------------------------------------------------------------------
// RFI status
// ---------------------------------------------------------------------------

export const RFI_STATUS_LABEL: Record<RFIStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESPONDED: "Responded",
  SUBMITTED: "Submitted",
  CLOSED: "Closed",
};

export const RFI_STATUS_TONE: Record<RFIStatus, Tone> = {
  OPEN: "red",
  IN_PROGRESS: "amber",
  RESPONDED: "blue",
  SUBMITTED: "blue",
  CLOSED: "green",
};

export const OPEN_RFI_STATUSES: RFIStatus[] = ["OPEN", "IN_PROGRESS", "RESPONDED"];

// ---------------------------------------------------------------------------
// Contact role
// ---------------------------------------------------------------------------

export const CONTACT_ROLE_LABEL: Record<ContactRole, string> = {
  ARCHITECT: "Architect",
  ENGINEER: "Engineer",
  LAND_DIVISION_COMPANY: "Land Division Company",
  SURVEYOR: "Surveyor",
  COUNCIL_CONTACT: "Council Contact",
  TAKE_OFF_COMPANY: "Take-Off Company",
  PRIVATE_CERTIFIER: "Private Certifier",
  BUILDER: "Builder",
  CLIENT: "Client",
  OTHER: "Other",
};

// ---------------------------------------------------------------------------
// Document type
// ---------------------------------------------------------------------------

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  LAND_PAPERS: "Land Papers",
  CONTOUR_SURVEY: "Contour Survey",
  BORE_LOG: "Bore Log",
  CONCEPT_PLAN: "Concept Plan",
  PLANNING_DRAWINGS: "Planning Drawings",
  SD_PLAN: "S&D Plan",
  PLANNING_APPROVAL: "Planning Approval",
  WORKING_DRAWINGS: "Working Drawings",
  ENERGY_RATING: "Energy Rating",
  FOOTING_REPORT: "Footing Report",
  TAKE_OFF: "Take-Off",
  CITB_RECEIPT: "CITB Receipt",
  BRC_CERTIFICATE: "BRC Certificate",
  LD_DRAFT_PLAN: "LD Draft Plan",
  LD_APPROVAL: "LD Approval",
  SA_WATER_INVOICE: "SA Water Invoice",
  OPEN_SPACE_INVOICE: "Open Space Invoice",
  SCAP_PLAN: "SCAP Plan",
  FINAL_TITLES: "Final Titles",
  OTHER: "Other",
};

// ---------------------------------------------------------------------------
// South Australian councils (seed / default select options)
// ---------------------------------------------------------------------------

export const SA_COUNCILS: string[] = [
  "City of Adelaide",
  "City of Charles Sturt",
  "City of Marion",
  "City of Onkaparinga",
  "City of Playford",
  "City of Port Adelaide Enfield",
  "City of Salisbury",
  "City of Tea Tree Gully",
  "City of West Torrens",
  "City of Mitcham",
  "City of Burnside",
  "City of Norwood Payneham & St Peters",
  "City of Unley",
  "City of Prospect",
  "Town of Gawler",
  "Adelaide Hills Council",
  "Mount Barker District Council",
];

// Responsible-entity types for a project (last option "Other" allows a custom label).
export const RESPONSIBLE_ENTITY_TYPES: string[] = [
  "Architect",
  "Surveyor",
  "Engineer",
  "Timber Company",
  "Take-off Company",
  "Certifier",
  "Land Division",
  "Builder",
  "Draftsperson",
  "Council Contact",
  "Other",
];

export const enumOptions = <T extends string>(
  record: Record<T, string>
): { value: T; label: string }[] =>
  (Object.keys(record) as T[]).map((value) => ({ value, label: record[value] }));
