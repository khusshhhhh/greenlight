import { prisma } from "./prisma";
import { isTaskDone } from "./business";
import type { WorkflowType } from "@prisma/client";
import type { TaskWithRelations } from "./client-types";

export async function getProjectDetail(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, ownerId: userId },
    include: {
      assignee: true,
      projectContacts: { include: { contact: true }, orderBy: { role: "asc" } },
      rfis: {
        include: { responsibleContact: { select: { id: true, companyName: true } } },
        orderBy: [{ workflowType: "asc" }, { rfiNumber: "asc" }],
      },
      documents: { orderBy: { uploadedDate: "desc" } },
      notes_list: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 40 },
      workflows: { orderBy: { type: "asc" } },
      entities: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!project) return null;

  const tasks = await prisma.task.findMany({
    where: { projectId: id, parentTaskId: null },
    orderBy: [{ sortOrder: "asc" }],
    include: {
      contact: true,
      variations: { include: { contact: true }, orderBy: { createdAt: "asc" } },
    },
  });

  const contacts = await prisma.contact.findMany({
    where: { ownerId: userId },
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, contactPerson: true, role: true },
  });

  const users = await prisma.user.findMany({
    where: { id: userId },
    select: { id: true, name: true },
  });

  // Group tasks by workflow type in canonical order.
  const order: WorkflowType[] = ["PLANNING", "DEVELOPMENT", "LAND_DIVISION"];
  const byWorkflow = order.map((type) => ({
    type,
    tasks: tasks.filter(
      (t) => project.workflows.find((w) => w.id === t.workflowId)?.type === type
    ),
  }));

  // Flat list of every task id considered "done" (incl. variations) for locks.
  const doneIds = tasks
    .flatMap((t) => [t, ...t.variations])
    .filter((t) => isTaskDone(t.status))
    .map((t) => t.id);

  const flatTasks = tasks.flatMap((t) => [t, ...t.variations]);

  return {
    project,
    tasks: tasks as TaskWithRelations[],
    byWorkflow: byWorkflow as { type: WorkflowType; tasks: TaskWithRelations[] }[],
    flatTasks,
    doneIds,
    contacts,
    users,
  };
}
