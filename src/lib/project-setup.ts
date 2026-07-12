import type { PrismaClient } from "@prisma/client";
import { WORKFLOW_TEMPLATES } from "./workflow-templates";
import { calcDueDate } from "./dates";

type Tx = Pick<PrismaClient, "workflow" | "task" | "taskDurationSetting">;

/**
 * Create every default workflow + task for a project from the templates.
 *
 * Runs in two passes so we can wire dependency task ids: first create all
 * tasks (recording templateKey -> id), then patch dependencyTaskIds.
 * Admin duration overrides from TaskDurationSetting are applied if present.
 */
export async function createDefaultWorkflows(
  tx: Tx,
  projectId: string,
  opts: { startDate?: Date | null; ownerId?: string } = {}
): Promise<void> {
  const overrides = opts.ownerId
    ? await tx.taskDurationSetting.findMany({ where: { ownerId: opts.ownerId } })
    : [];
  const durationByKey = new Map(overrides.map((o) => [o.templateKey, o.estimatedDays]));

  const keyToId = new Map<string, string>();
  const dependencyByKey = new Map<string, string[]>();

  for (const wf of WORKFLOW_TEMPLATES) {
    const workflow = await tx.workflow.create({
      data: { projectId, type: wf.type, title: wf.title },
    });

    let order = 0;
    for (const t of wf.tasks) {
      const estimatedDays = durationByKey.get(t.key) ?? t.estimatedDays ?? null;
      // Seed the first task's requested date from the project start date.
      const requestedDate =
        order === 0 && opts.startDate ? opts.startDate : null;
      const dueDate = calcDueDate(requestedDate, estimatedDays);

      const task = await tx.task.create({
        data: {
          projectId,
          workflowId: workflow.id,
          title: t.title,
          description: t.description ?? null,
          responsibleParty: t.responsibleParty ?? null,
          estimatedDays,
          requestedDate,
          dueDate,
          isRepeatable: t.isRepeatable ?? false,
          templateKey: t.key,
          sortOrder: order,
        },
      });

      keyToId.set(t.key, task.id);
      if (t.dependsOn?.length) dependencyByKey.set(t.key, t.dependsOn);
      order += 1;
    }
  }

  // Second pass: resolve dependency template keys to task ids.
  for (const [key, depKeys] of dependencyByKey.entries()) {
    const id = keyToId.get(key);
    if (!id) continue;
    const depIds = depKeys
      .map((k) => keyToId.get(k))
      .filter((v): v is string => !!v);
    if (depIds.length) {
      await tx.task.update({
        where: { id },
        data: { dependencyTaskIds: depIds },
      });
    }
  }
}
