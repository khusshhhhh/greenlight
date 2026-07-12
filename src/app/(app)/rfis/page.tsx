import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RfiStatusBadge } from "@/components/status-badge";
import { OPEN_RFI_STATUSES, WORKFLOW_SHORT } from "@/lib/constants";
import { fmtDate, daysRemainingLabel } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RfisPage({
  searchParams,
}: {
  searchParams: { scope?: string };
}) {
  const userId = await requireUserId();
  const openOnly = searchParams.scope !== "all";
  const rfis = await prisma.rFI.findMany({
    where: {
      project: { ownerId: userId },
      ...(openOnly ? { status: { in: OPEN_RFI_STATUSES } } : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      responsibleContact: { select: { companyName: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="RFIs"
        description="Requests for information across every project and workflow."
      >
        <div className="flex gap-1 rounded-lg border p-1 text-sm">
          <Link
            href="/rfis"
            className={`rounded-md px-3 py-1 ${openOnly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Open
          </Link>
          <Link
            href="/rfis?scope=all"
            className={`rounded-md px-3 py-1 ${!openOnly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            All
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFI</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Sent to</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfis.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {WORKFLOW_SHORT[r.workflowType]} {r.rfiNumber}
                  </TableCell>
                  <TableCell>
                    <Link href={`/projects/${r.project.id}`} className="text-primary hover:underline">
                      {r.project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{r.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {r.responsibleContact?.companyName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <RfiStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {fmtDate(r.dueDate)}
                    {r.dueDate && OPEN_RFI_STATUSES.includes(r.status) && (
                      <span
                        className={
                          daysRemainingLabel(r.dueDate).includes("overdue")
                            ? "ml-1 text-xs text-red-600 dark:text-red-400"
                            : "ml-1 text-xs text-muted-foreground"
                        }
                      >
                        ({daysRemainingLabel(r.dueDate)})
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rfis.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No {openOnly ? "open " : ""}RFIs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
