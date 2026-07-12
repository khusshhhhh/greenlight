import type { PrismaClient } from "@prisma/client";
import { ALL_TASK_TEMPLATES } from "./workflow-templates";
import { SA_COUNCILS } from "./constants";

type Tx = Pick<PrismaClient, "taskDurationSetting" | "council">;

/**
 * Seed a brand-new account with its own editable defaults: the standard SA
 * council list and the default task durations (copied from the templates).
 * Everything is scoped to the account via ownerId.
 */
export async function provisionNewUser(tx: Tx, ownerId: string): Promise<void> {
  await tx.taskDurationSetting.createMany({
    data: ALL_TASK_TEMPLATES.filter((t) => t.estimatedDays != null).map((t) => ({
      ownerId,
      templateKey: t.key,
      workflowType: t.workflowType,
      label: t.title,
      estimatedDays: t.estimatedDays!,
    })),
    skipDuplicates: true,
  });

  await tx.council.createMany({
    data: SA_COUNCILS.map((name) => ({ ownerId, name })),
    skipDuplicates: true,
  });
}
