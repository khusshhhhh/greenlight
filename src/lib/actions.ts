"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireUserId } from "./session";
import { createDefaultWorkflows } from "./project-setup";
import { calcDueDate } from "./dates";
import { TASK_STATUS_LABEL } from "./constants";
import type {
  ContactRole,
  DocumentType,
  Priority,
  ProjectStatus,
  RFIStatus,
  TaskStatus,
  WorkflowType,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Ownership guards — every mutation confirms the row belongs to the caller.
// ---------------------------------------------------------------------------

async function assertProjectOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project || project.ownerId !== userId) throw new Error("Not found");
}

async function ownedTaskOr404(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { ownerId: true } } },
  });
  if (!task || task.project.ownerId !== userId) throw new Error("Not found");
  return task;
}

async function ownedRfiOr404(rfiId: string, userId: string) {
  const rfi = await prisma.rFI.findUnique({
    where: { id: rfiId },
    include: { project: { select: { ownerId: true } } },
  });
  if (!rfi || rfi.project.ownerId !== userId) throw new Error("Not found");
  return rfi;
}

async function logActivity(data: {
  projectId: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  taskId?: string | null;
  rfiId?: string | null;
  userId?: string | null;
  createdBy?: string | null;
}) {
  await prisma.activityLog.create({ data: { createdBy: "You", ...data } });
}

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
}
function date(fd: FormData, key: string): Date | null {
  const s = str(fd, key);
  return s ? new Date(s) : null;
}
function num(fd: FormData, key: string): number | null {
  const s = str(fd, key);
  return s ? Number(s) : null;
}

/** Restrict a contact id to one the caller owns (or null). */
async function ownedContactId(id: string | null, userId: string): Promise<string | null> {
  if (!id) return null;
  const c = await prisma.contact.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
  return c?.id ?? null;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProject(fd: FormData) {
  const userId = await requireUserId();
  const name = str(fd, "name");
  if (!name) throw new Error("Project name is required");
  const startDate = date(fd, "startDate");

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
      address: str(fd, "address"),
      clientName: str(fd, "clientName"),
      clientPhone: str(fd, "clientPhone"),
      clientEmail: str(fd, "clientEmail"),
      lotNumber: str(fd, "lotNumber"),
      council: str(fd, "council"),
      applicationNumber: str(fd, "applicationNumber"),
      planSAReference: str(fd, "planSAReference"),
      status: (str(fd, "status") as ProjectStatus) ?? "ACTIVE",
      priority: (str(fd, "priority") as Priority) ?? "MEDIUM",
      startDate,
      targetDate: date(fd, "targetDate"),
      notes: str(fd, "notes"),
      stakeholderName: str(fd, "stakeholderName"),
      stakeholderRole: str(fd, "stakeholderRole"),
      stakeholderContact: str(fd, "stakeholderContact"),
      storeys: str(fd, "storeys"),
      bedrooms: num(fd, "bedrooms"),
      bathrooms: num(fd, "bathrooms"),
      showers: num(fd, "showers"),
      livingAreas: num(fd, "livingAreas"),
      carSpaces: num(fd, "carSpaces"),
    },
  });

  await createDefaultWorkflows(prisma, project.id, { startDate, ownerId: userId });
  await logActivity({ projectId: project.id, action: "Project created", newValue: name });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(projectId: string, fd: FormData) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: str(fd, "name") ?? undefined,
      address: str(fd, "address"),
      clientName: str(fd, "clientName"),
      clientPhone: str(fd, "clientPhone"),
      clientEmail: str(fd, "clientEmail"),
      lotNumber: str(fd, "lotNumber"),
      council: str(fd, "council"),
      applicationNumber: str(fd, "applicationNumber"),
      planSAReference: str(fd, "planSAReference"),
      status: (str(fd, "status") as ProjectStatus) ?? undefined,
      priority: (str(fd, "priority") as Priority) ?? undefined,
      startDate: date(fd, "startDate"),
      targetDate: date(fd, "targetDate"),
      notes: str(fd, "notes"),
      stakeholderName: str(fd, "stakeholderName"),
      stakeholderRole: str(fd, "stakeholderRole"),
      stakeholderContact: str(fd, "stakeholderContact"),
      storeys: str(fd, "storeys"),
      bedrooms: num(fd, "bedrooms"),
      bathrooms: num(fd, "bathrooms"),
      showers: num(fd, "showers"),
      livingAreas: num(fd, "livingAreas"),
      carSpaces: num(fd, "carSpaces"),
    },
  });
  await logActivity({ projectId, action: "Project updated" });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function setProjectStatus(projectId: string, status: ProjectStatus) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  const prev = await prisma.project.findUnique({ where: { id: projectId } });
  await prisma.project.update({ where: { id: projectId }, data: { status } });
  await logActivity({
    projectId,
    action: status === "ARCHIVED" ? "Project archived" : "Project status changed",
    oldValue: prev?.status,
    newValue: status,
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProject(projectId: string) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function updateTask(taskId: string, fd: FormData) {
  const userId = await requireUserId();
  const existing = await ownedTaskOr404(taskId, userId);

  const requestedDate = date(fd, "requestedDate") ?? existing.requestedDate;
  const estimatedDays = num(fd, "estimatedDays") ?? existing.estimatedDays;
  const status = (str(fd, "status") as TaskStatus) ?? existing.status;
  const explicitDue = date(fd, "dueDate");
  const dueDate = explicitDue ?? calcDueDate(requestedDate, estimatedDays) ?? existing.dueDate;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: str(fd, "title") ?? existing.title,
      description: str(fd, "description"),
      responsibleParty: str(fd, "responsibleParty"),
      contactId: await ownedContactId(str(fd, "contactId"), userId),
      status,
      priority: (str(fd, "priority") as Priority) ?? existing.priority,
      requestedDate,
      dueDate,
      completedDate: date(fd, "completedDate"),
      estimatedDays,
      notes: str(fd, "notes"),
    },
  });

  await logActivity({
    projectId: existing.projectId,
    taskId,
    action: status !== existing.status ? "Task status changed" : "Task updated",
    oldValue: status !== existing.status ? TASK_STATUS_LABEL[existing.status] : null,
    newValue: status !== existing.status ? TASK_STATUS_LABEL[status] : null,
  });

  revalidatePath(`/projects/${existing.projectId}`);
  revalidatePath("/dashboard");
}

export async function setTaskStatus(taskId: string, status: TaskStatus) {
  const userId = await requireUserId();
  const existing = await ownedTaskOr404(taskId, userId);
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completedDate:
        ["COMPLETED", "APPROVED", "RECEIVED"].includes(status) && !existing.completedDate
          ? new Date()
          : existing.completedDate,
    },
  });
  await logActivity({
    projectId: existing.projectId,
    taskId,
    action: "Task status changed",
    oldValue: TASK_STATUS_LABEL[existing.status],
    newValue: TASK_STATUS_LABEL[status],
  });
  revalidatePath(`/projects/${existing.projectId}`);
  revalidatePath("/dashboard");
}

export async function bulkSetTaskStatus(taskIds: string[], status: TaskStatus) {
  const userId = await requireUserId();
  if (!taskIds.length) return;
  // Only touch tasks whose project the caller owns.
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, project: { ownerId: userId } },
    select: { id: true, projectId: true },
  });
  const ids = tasks.map((t) => t.id);
  if (!ids.length) return;
  await prisma.task.updateMany({ where: { id: { in: ids } }, data: { status } });
  for (const projectId of [...new Set(tasks.map((t) => t.projectId))]) {
    await logActivity({
      projectId,
      action: "Bulk status update",
      newValue: `${ids.length} tasks → ${TASK_STATUS_LABEL[status]}`,
    });
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/dashboard");
}

export async function addTaskVariation(parentTaskId: string) {
  const userId = await requireUserId();
  const parent = await ownedTaskOr404(parentTaskId, userId);
  const count = await prisma.task.count({ where: { parentTaskId: parent.id } });
  const n = count + 1;
  await prisma.task.create({
    data: {
      projectId: parent.projectId,
      workflowId: parent.workflowId,
      parentTaskId: parent.id,
      title: `${parent.title.replace(/ Variations?$/i, "")} — Variation ${n}`,
      responsibleParty: parent.responsibleParty,
      estimatedDays: parent.estimatedDays,
      isRepeatable: false,
      sortOrder: parent.sortOrder,
      templateKey: parent.templateKey ? `${parent.templateKey}-v${n}` : null,
    },
  });
  await logActivity({
    projectId: parent.projectId,
    action: "Variation added",
    newValue: `Variation ${n} of ${parent.title}`,
  });
  revalidatePath(`/projects/${parent.projectId}`);
}

// ---------------------------------------------------------------------------
// RFIs
// ---------------------------------------------------------------------------

export async function createRfi(projectId: string, fd: FormData) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  const workflowType = (str(fd, "workflowType") as WorkflowType) ?? "PLANNING";
  const last = await prisma.rFI.findFirst({
    where: { projectId, workflowType },
    orderBy: { rfiNumber: "desc" },
  });
  const rfiNumber = (last?.rfiNumber ?? 0) + 1;

  await prisma.rFI.create({
    data: {
      projectId,
      workflowType,
      rfiNumber,
      title: str(fd, "title") ?? `RFI ${rfiNumber}`,
      description: str(fd, "description"),
      receivedFrom: str(fd, "receivedFrom"),
      responsibleContactId: await ownedContactId(str(fd, "responsibleContactId"), userId),
      internalOwnerId: userId,
      dateReceived: date(fd, "dateReceived"),
      dueDate: date(fd, "dueDate"),
      status: (str(fd, "status") as RFIStatus) ?? "OPEN",
      notes: str(fd, "notes"),
    },
  });
  await logActivity({ projectId, action: "RFI added", newValue: `${workflowType} RFI ${rfiNumber}` });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/rfis");
  revalidatePath("/dashboard");
}

export async function updateRfi(rfiId: string, fd: FormData) {
  const userId = await requireUserId();
  const existing = await ownedRfiOr404(rfiId, userId);
  const status = (str(fd, "status") as RFIStatus) ?? existing.status;
  await prisma.rFI.update({
    where: { id: rfiId },
    data: {
      title: str(fd, "title") ?? existing.title,
      description: str(fd, "description"),
      receivedFrom: str(fd, "receivedFrom"),
      responsibleContactId: await ownedContactId(str(fd, "responsibleContactId"), userId),
      dateReceived: date(fd, "dateReceived"),
      dueDate: date(fd, "dueDate"),
      responseReceivedDate: date(fd, "responseReceivedDate"),
      submittedDate: date(fd, "submittedDate"),
      status,
      notes: str(fd, "notes"),
    },
  });
  await logActivity({
    projectId: existing.projectId,
    rfiId,
    action: status === "CLOSED" ? "RFI completed" : "RFI updated",
    oldValue: existing.status,
    newValue: status,
  });
  revalidatePath(`/projects/${existing.projectId}`);
  revalidatePath("/rfis");
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Contacts / assignment
// ---------------------------------------------------------------------------

export async function createContact(fd: FormData) {
  const userId = await requireUserId();
  await prisma.contact.create({
    data: {
      ownerId: userId,
      companyName: str(fd, "companyName") ?? "Unnamed",
      contactPerson: str(fd, "contactPerson"),
      role: (str(fd, "role") as ContactRole) ?? "OTHER",
      phone: str(fd, "phone"),
      email: str(fd, "email"),
      address: str(fd, "address"),
      notes: str(fd, "notes"),
    },
  });
  revalidatePath("/contacts");
}

export async function assignContact(projectId: string, fd: FormData) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  const contactId = await ownedContactId(str(fd, "contactId"), userId);
  const role = str(fd, "role") as ContactRole;
  if (!contactId || !role) return;
  await prisma.projectContact.upsert({
    where: { projectId_contactId_role: { projectId, contactId, role } },
    update: {},
    create: { projectId, contactId, role },
  });
  await logActivity({ projectId, action: "Contact assigned", newValue: role });
  revalidatePath(`/projects/${projectId}`);
}

export async function unassignContact(projectContactId: string, projectId: string) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  await prisma.projectContact.deleteMany({ where: { id: projectContactId, projectId } });
  revalidatePath(`/projects/${projectId}`);
}

// ---------------------------------------------------------------------------
// Notes & documents
// ---------------------------------------------------------------------------

export async function addNote(projectId: string, fd: FormData) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  const content = str(fd, "content");
  if (!content) return;
  await prisma.note.create({
    data: { projectId, taskId: str(fd, "taskId"), rfiId: str(fd, "rfiId"), content, createdBy: "You" },
  });
  await logActivity({ projectId, action: "Note added" });
  revalidatePath(`/projects/${projectId}`);
}

export async function addDocument(projectId: string, fd: FormData) {
  const userId = await requireUserId();
  await assertProjectOwner(projectId, userId);
  await prisma.document.create({
    data: {
      projectId,
      documentType: (str(fd, "documentType") as DocumentType) ?? "OTHER",
      workflowType: (str(fd, "workflowType") as WorkflowType) ?? null,
      name: str(fd, "name") ?? "Untitled document",
      version: num(fd, "version") ?? 1,
      fileUrl: str(fd, "fileUrl"),
      uploadedBy: "You",
      notes: str(fd, "notes"),
    },
  });
  await logActivity({ projectId, action: "Document added", newValue: str(fd, "name") });
  revalidatePath(`/projects/${projectId}`);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function addCouncil(fd: FormData) {
  const userId = await requireUserId();
  const name = str(fd, "name");
  if (!name) return;
  await prisma.council.upsert({
    where: { ownerId_name: { ownerId: userId, name } },
    update: { region: str(fd, "region") },
    create: { ownerId: userId, name, region: str(fd, "region") },
  });
  revalidatePath("/settings");
}

export async function updateTaskDuration(id: string, estimatedDays: number) {
  const userId = await requireUserId();
  await prisma.taskDurationSetting.updateMany({
    where: { id, ownerId: userId },
    data: { estimatedDays },
  });
  revalidatePath("/settings");
}

// ---------------------------------------------------------------------------
// Account / profile
// ---------------------------------------------------------------------------

export async function setNotificationsEnabled(enabled: boolean) {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled: enabled },
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updateProfile(fd: FormData) {
  const userId = await requireUserId();
  const name = str(fd, "name");
  const image = str(fd, "image"); // data URL or "" to clear

  // Guard against oversized images (client resizes to ~256px first).
  if (image && image.length > 800_000) {
    throw new Error("Image is too large. Please choose a smaller photo.");
  }
  if (image && !/^data:image\//.test(image) && image !== "__clear__") {
    throw new Error("Invalid image.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name ? { name } : {}),
      ...(image === "__clear__" ? { image: null } : image ? { image } : {}),
    },
  });
  revalidatePath("/settings");
}
