"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  Download,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectForm } from "@/components/project-form";
import { setProjectStatus, deleteProject, updateProject } from "@/lib/actions";
import { toast } from "@/components/ui/toast";
import { toInputDate } from "@/lib/dates";
import type { Project } from "@prisma/client";

export function ProjectActions({
  project,
  councils,
}: {
  project: Project;
  councils: string[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const editAction = async (fd: FormData) => {
    await updateProject(project.id, fd);
    toast.success("Project updated");
    setEditOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="h-4 w-4" /> Edit
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              startTransition(() =>
                setProjectStatus(project.id, "APPROVED").then(() =>
                  toast.success("Project approved")
                )
              )
            }
          >
            <CheckCircle2 className="h-4 w-4" /> Mark approved
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/api/projects/${project.id}/export`}>
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/projects/${project.id}/print`} target="_blank" rel="noreferrer">
              <Printer className="h-4 w-4" /> Print report
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() =>
              startTransition(() =>
                setProjectStatus(project.id, "ARCHIVED").then(() =>
                  toast.success("Project archived")
                )
              )
            }
          >
            <Archive className="h-4 w-4" /> Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                startTransition(async () => {
                  await deleteProject(project.id);
                  router.push("/projects");
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            councils={councils}
            action={editAction}
            submitLabel="Save changes"
            defaultValues={{
              name: project.name,
              address: project.address ?? "",
              clientName: project.clientName ?? "",
              clientPhone: project.clientPhone ?? "",
              clientEmail: project.clientEmail ?? "",
              lotNumber: project.lotNumber ?? "",
              council: project.council ?? "",
              applicationNumber: project.applicationNumber ?? "",
              planSAReference: project.planSAReference ?? "",
              status: project.status,
              startDate: toInputDate(project.startDate),
              targetDate: toInputDate(project.targetDate),
              notes: project.notes ?? "",
              storeys: project.storeys ?? "",
              bedrooms: project.bedrooms != null ? String(project.bedrooms) : "",
              bathrooms: project.bathrooms != null ? String(project.bathrooms) : "",
              showers: project.showers != null ? String(project.showers) : "",
              livingAreas: project.livingAreas != null ? String(project.livingAreas) : "",
              carSpaces: project.carSpaces != null ? String(project.carSpaces) : "",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
