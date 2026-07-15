import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/project-data";
import { requireUserId } from "@/lib/session";
import { PrintButton } from "@/components/print-button";
import {
  PROJECT_STATUS_LABEL,
  PRIORITY_LABEL,
  WORKFLOW_LABEL,
  TASK_STATUS_LABEL,
  RFI_STATUS_LABEL,
  WORKFLOW_SHORT,
} from "@/lib/constants";
import { projectProgress } from "@/lib/business";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const data = await getProjectDetail(params.id, userId);
  if (!data) notFound();
  const { project, byWorkflow } = data;
  const progress = projectProgress(byWorkflow.flatMap((w) => w.tasks));

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 text-slate-900">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton />
      </div>

      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-slate-600">{project.address}</p>
        <p className="mt-1 text-sm">
          Status: <strong>{PROJECT_STATUS_LABEL[project.status]}</strong> · Priority:{" "}
          <strong>{PRIORITY_LABEL[project.priority]}</strong> · Progress:{" "}
          <strong>{progress}%</strong>
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <div>Client: <strong>{project.clientName ?? "—"}</strong></div>
        <div>Council: <strong>{project.council ?? "—"}</strong></div>
        <div>Client phone: <strong>{project.clientPhone ?? "—"}</strong></div>
        <div>Client email: <strong>{project.clientEmail ?? "—"}</strong></div>
        <div>Lot number: <strong>{project.lotNumber ?? "—"}</strong></div>
        <div>Application no.: <strong>{project.applicationNumber ?? "—"}</strong></div>
        <div>PlanSA ref: <strong>{project.planSAReference ?? "—"}</strong></div>
        <div>Start date: <strong>{fmtDate(project.startDate)}</strong></div>
        <div>Target date: <strong>{fmtDate(project.targetDate)}</strong></div>
        <div>Assigned: <strong>{project.assignee?.name ?? "—"}</strong></div>
      </section>

      {project.entities.length > 0 && (
        <section className="print-break mb-6">
          <h2 className="mb-2 text-lg font-semibold">Responsible entities</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-2">Type</th>
                <th className="py-1 pr-2">Name</th>
                <th className="py-1 pr-2">Contact</th>
              </tr>
            </thead>
            <tbody>
              {project.entities.map((ent) => (
                <tr key={ent.id} className="border-b border-slate-100">
                  <td className="py-1 pr-2">{ent.type}</td>
                  <td className="py-1 pr-2">{ent.name}</td>
                  <td className="py-1 pr-2">{ent.contact ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {byWorkflow.map((wf) => (
        <section key={wf.type} className="print-break mb-6">
          <h2 className="mb-2 text-lg font-semibold">{WORKFLOW_LABEL[wf.type]}</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-2">Task</th>
                <th className="py-1 pr-2">Responsible</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Due</th>
                <th className="py-1 pr-2">Completed</th>
              </tr>
            </thead>
            <tbody>
              {wf.tasks.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-1 pr-2">{t.title}</td>
                  <td className="py-1 pr-2">{t.responsibleParty ?? "—"}</td>
                  <td className="py-1 pr-2">{TASK_STATUS_LABEL[t.status]}</td>
                  <td className="py-1 pr-2">{fmtDate(t.dueDate)}</td>
                  <td className="py-1 pr-2">{fmtDate(t.completedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {project.rfis.length > 0 && (
        <section className="print-break mb-6">
          <h2 className="mb-2 text-lg font-semibold">RFIs</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-2">RFI</th>
                <th className="py-1 pr-2">Title</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {project.rfis.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-1 pr-2">
                    {WORKFLOW_SHORT[r.workflowType]} {r.rfiNumber}
                  </td>
                  <td className="py-1 pr-2">{r.title}</td>
                  <td className="py-1 pr-2">{RFI_STATUS_LABEL[r.status]}</td>
                  <td className="py-1 pr-2">{fmtDate(r.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="mt-8 border-t pt-3 text-xs text-slate-500">
        Generated by Greenlight · {fmtDate(new Date())}
      </footer>
    </div>
  );
}
