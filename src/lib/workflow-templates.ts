import type { WorkflowType } from "@prisma/client";

/**
 * Reusable workflow templates.
 *
 * These are the single source of truth for the default tasks created for every
 * new project. Admins can override estimated durations via the
 * `TaskDurationSetting` table (see /settings) without touching this file.
 *
 * `estimatedDays: 0` means "instant" (no waiting period).
 */
export interface TaskTemplate {
  /** Stable key used for dependency wiring, duration overrides and doc links. */
  key: string;
  title: string;
  description?: string;
  responsibleParty?: string;
  estimatedDays?: number;
  isRepeatable?: boolean;
  /** Template keys this task depends on before it can start. */
  dependsOn?: string[];
}

export interface WorkflowTemplate {
  type: WorkflowType;
  title: string;
  tasks: TaskTemplate[];
}

export const PLANNING_TEMPLATE: WorkflowTemplate = {
  type: "PLANNING",
  title: "Planning Approval",
  tasks: [
    {
      key: "land-papers",
      title: "Land Paper / Documents",
      description: "Collect land documents and required property papers.",
      responsibleParty: "Client / Internal team",
      estimatedDays: 0,
    },
    {
      key: "contour-survey",
      title: "Contour Survey and Bore Log",
      description: "Request contour survey and bore log as soon as the project starts.",
      responsibleParty: "Surveyor",
      estimatedDays: 21,
    },
    {
      key: "concept-plan",
      title: "Concept Plan",
      description: "Architect prepares concept plan. Supports multiple variations.",
      responsibleParty: "Architect",
      estimatedDays: 7,
    },
    {
      key: "concept-plan-variations",
      title: "Concept Plan Variations",
      description: "Repeatable — add Variation 1, 2, 3… each with its own dates, notes and status.",
      responsibleParty: "Architect",
      estimatedDays: 7,
      isRepeatable: true,
    },
    {
      key: "planning-drawings",
      title: "Planning Drawings",
      description: "Request planning drawings after concept plan approval.",
      responsibleParty: "Architect",
      estimatedDays: 14,
      dependsOn: ["concept-plan"],
    },
    {
      key: "sd-plan",
      title: "Site and Drainage Plan (S&D)",
      description: "Engineer prepares site and drainage plan.",
      responsibleParty: "Engineer",
      estimatedDays: 7,
    },
    {
      key: "lodge-planning",
      title: "Lodge Planning Application in PlanSA",
      description: "Lodge once Planning Drawings and S&D are complete. Store PlanSA lodgement date and reference number.",
      responsibleParty: "Internal team",
      estimatedDays: 0,
      dependsOn: ["planning-drawings", "sd-plan"],
    },
    {
      key: "planning-rfi",
      title: "Planning RFI Follow Ups",
      description: "Repeatable — track council RFIs raised against the planning application.",
      responsibleParty: "Internal team",
      isRepeatable: true,
    },
    {
      key: "planning-approval",
      title: "Planning Approval Received",
      description: "Store approval date and conditions once granted.",
      responsibleParty: "PlanSA / Council",
      dependsOn: ["lodge-planning"],
    },
  ],
};

export const DEVELOPMENT_TEMPLATE: WorkflowTemplate = {
  type: "DEVELOPMENT",
  title: "Development Approval / BRC",
  tasks: [
    {
      key: "working-drawings",
      title: "Request Working Drawings (WD)",
      description: "Request working drawings. Requires Planning Approval to be received.",
      responsibleParty: "Architect",
      estimatedDays: 14,
      dependsOn: ["planning-approval"],
    },
    {
      key: "energy-rating",
      title: "Energy Rating",
      description: "Energy rating assessment. Not dependent on other documents.",
      responsibleParty: "Architect",
      estimatedDays: 7,
    },
    {
      key: "footing-report",
      title: "Footing Report",
      description: "Engineer prepares footing report from working drawings.",
      responsibleParty: "Engineer",
      estimatedDays: 7,
      dependsOn: ["working-drawings"],
    },
    {
      key: "take-offs",
      title: "Take-Offs",
      description: "Material take-offs from working drawings.",
      responsibleParty: "Take-Off / Timber company",
      estimatedDays: 14,
      dependsOn: ["working-drawings"],
    },
    {
      key: "citb-levy",
      title: "CITB Levy Receipt",
      description: "Calculate, pay and download the CITB levy receipt. Store amount and receipt number.",
      responsibleParty: "Internal team",
      estimatedDays: 0,
    },
    {
      key: "apply-brc",
      title: "Apply for BRC through Private Certifier",
      description: "Submit BRC application. Requires WD, Energy Rating, Footing Report, Take-Offs and CITB completed.",
      responsibleParty: "Private Certifier",
      estimatedDays: 0,
      dependsOn: ["working-drawings", "energy-rating", "footing-report", "take-offs", "citb-levy"],
    },
    {
      key: "brc-rfi",
      title: "BRC RFI Follow Ups",
      description: "Repeatable — track certifier / council RFIs for the BRC application.",
      responsibleParty: "Internal team",
      isRepeatable: true,
    },
    {
      key: "brc-approval",
      title: "BRC / Development Approval Received",
      description: "Store approval date, certificate / reference number and approval notes.",
      responsibleParty: "Private Certifier",
      dependsOn: ["apply-brc"],
    },
  ],
};

export const LAND_DIVISION_TEMPLATE: WorkflowTemplate = {
  type: "LAND_DIVISION",
  title: "Land Division",
  tasks: [
    {
      key: "send-job-ld",
      title: "Send Job to Land Division Company",
      responsibleParty: "Land Division Company",
      estimatedDays: 0,
    },
    {
      key: "draft-ld-plan",
      title: "Draft Land Division Plan Received",
      description: "Typically 3–4 days.",
      responsibleParty: "Land Division Company",
      estimatedDays: 4,
      dependsOn: ["send-job-ld"],
    },
    {
      key: "internal-approval-ld",
      title: "Internal Approval of Draft LD Plan",
      description: "Store approved by, approval date and notes.",
      responsibleParty: "Internal team",
      estimatedDays: 2,
      dependsOn: ["draft-ld-plan"],
    },
    {
      key: "lodge-ld",
      title: "Lodge Land Division Application in PlanSA",
      description: "Store lodgement date and PlanSA reference number.",
      responsibleParty: "Land Division Company",
      estimatedDays: 0,
      dependsOn: ["internal-approval-ld"],
    },
    {
      key: "wait-council-ld",
      title: "Wait for Council Reply / LD Approval",
      responsibleParty: "Council / PlanSA",
      estimatedDays: 30,
      dependsOn: ["lodge-ld"],
    },
    {
      key: "ld-rfi",
      title: "LD RFI Follow Ups",
      description: "Repeatable — track RFIs raised against the land division application.",
      responsibleParty: "Internal team",
      isRepeatable: true,
    },
    {
      key: "ld-approval",
      title: "LD Approval Received",
      description: "Store approval date and approval conditions.",
      responsibleParty: "Council / PlanSA",
      dependsOn: ["wait-council-ld"],
    },
    {
      key: "wait-demolition",
      title: "Wait for Site Demolition",
      description: "Store demolition expected date and completed date.",
      responsibleParty: "Builder / Client / Internal team",
    },
    {
      key: "pegging",
      title: "Pegging of Site",
      responsibleParty: "Surveyor / Land Division Company",
      estimatedDays: 7,
      dependsOn: ["wait-demolition"],
    },
    {
      key: "sa-water-application",
      title: "Lodge SA Water Application",
      description: "Expected response about 2 weeks.",
      responsibleParty: "Land Division Company",
      estimatedDays: 14,
      dependsOn: ["pegging"],
    },
    {
      key: "sa-water-invoice",
      title: "SA Water Invoice Received",
      description: "Store invoice date, amount and due date.",
      responsibleParty: "SA Water",
      dependsOn: ["sa-water-application"],
    },
    {
      key: "sa-water-paid",
      title: "SA Water Invoice Paid",
      description: "Store paid date and receipt / reference.",
      responsibleParty: "Internal team",
      dependsOn: ["sa-water-invoice"],
    },
    {
      key: "open-space-apply",
      title: "Apply for Open Space",
      description: "Can run simultaneously with the SA Water application.",
      responsibleParty: "Land Division Company / Council process",
      estimatedDays: 14,
      dependsOn: ["pegging"],
    },
    {
      key: "open-space-invoice",
      title: "Open Space Invoice Received",
      description: "Store invoice date, amount and due date.",
      responsibleParty: "Council",
      dependsOn: ["open-space-apply"],
    },
    {
      key: "open-space-paid",
      title: "Open Space Invoice Paid",
      description: "Store paid date and receipt / reference.",
      responsibleParty: "Internal team",
      dependsOn: ["open-space-invoice"],
    },
    {
      key: "scap-plan",
      title: "Apply for SCAP Plan",
      description: "Requires SA Water and Open Space payments completed.",
      responsibleParty: "Land Division Company",
      estimatedDays: 14,
      dependsOn: ["sa-water-paid", "open-space-paid"],
    },
    {
      key: "final-titles",
      title: "Wait for Final Titles",
      description: "Final step. Store title expected date and final title received date.",
      responsibleParty: "Lands Titles Office",
      dependsOn: ["scap-plan"],
    },
  ],
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  PLANNING_TEMPLATE,
  DEVELOPMENT_TEMPLATE,
  LAND_DIVISION_TEMPLATE,
];

export function getWorkflowTemplate(type: WorkflowType): WorkflowTemplate {
  const found = WORKFLOW_TEMPLATES.find((w) => w.type === type);
  if (!found) throw new Error(`Unknown workflow type: ${type}`);
  return found;
}

/** Flat list of every default (non-repeatable is included too) template task. */
export const ALL_TASK_TEMPLATES: (TaskTemplate & { workflowType: WorkflowType })[] =
  WORKFLOW_TEMPLATES.flatMap((w) =>
    w.tasks.map((t) => ({ ...t, workflowType: w.type }))
  );
