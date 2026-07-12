import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TASK_STATUS_LABEL, WORKFLOW_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import { fmtDate } from "@/lib/dates";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.id, ownerId: session.user.id },
    include: { workflows: true },
  });
  if (!project) return new Response("Not found", { status: 404 });

  const tasks = await prisma.task.findMany({
    where: { projectId: params.id },
    orderBy: [{ sortOrder: "asc" }],
    include: { contact: true },
  });
  const wfType = new Map(project.workflows.map((w) => [w.id, w.type]));

  const header = [
    "Workflow",
    "Task",
    "Responsible party",
    "Linked contact",
    "Status",
    "Priority",
    "Requested date",
    "Due date",
    "Completed date",
    "Estimated days",
    "Notes",
  ];

  const rows = tasks.map((t) =>
    [
      WORKFLOW_LABEL[wfType.get(t.workflowId)!] ?? "",
      t.title,
      t.responsibleParty ?? "",
      t.contact?.companyName ?? "",
      TASK_STATUS_LABEL[t.status],
      PRIORITY_LABEL[t.priority],
      fmtDate(t.requestedDate),
      fmtDate(t.dueDate),
      fmtDate(t.completedDate),
      t.estimatedDays ?? "",
      t.notes ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");
  const filename = `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
