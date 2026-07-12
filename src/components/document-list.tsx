"use client";

import * as React from "react";
import { Plus, FileText, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addDocument } from "@/lib/actions";
import { DOCUMENT_TYPE_LABEL, WORKFLOW_LABEL, enumOptions } from "@/lib/constants";
import { fmtDate } from "@/lib/dates";
import type { DocumentType, WorkflowType } from "@prisma/client";
import type { Document } from "@/lib/client-types";

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => (
  <select
    ref={ref}
    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    {...props}
  />
));
NativeSelect.displayName = "NativeSelect";

export function DocumentList({
  projectId,
  documents,
}: {
  projectId: string;
  documents: Document[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addDocument(projectId, fd);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Documents ({documents.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Add document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add document record</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Document name</Label>
                <Input name="name" required placeholder="e.g. Working Drawings v2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Type</Label>
                  <NativeSelect name="documentType" defaultValue="OTHER">
                    {enumOptions<DocumentType>(DOCUMENT_TYPE_LABEL).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label className="mb-1.5 block">Workflow</Label>
                  <NativeSelect name="workflowType" defaultValue="">
                    <option value="">— None —</option>
                    {(Object.keys(WORKFLOW_LABEL) as WorkflowType[]).map((w) => (
                      <option key={w} value={w}>
                        {WORKFLOW_LABEL[w]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label className="mb-1.5 block">Version</Label>
                  <Input type="number" name="version" defaultValue={1} min={1} />
                </div>
                <div>
                  <Label className="mb-1.5 block">File URL (placeholder)</Label>
                  <Input name="fileUrl" placeholder="https://…" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Notes</Label>
                <Textarea name="notes" />
              </div>
              <p className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Upload className="h-3.5 w-3.5" /> Real file upload can be wired to S3 / Vercel Blob
                later — records are stored now with a URL placeholder.
              </p>
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Add document"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {documents.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No documents yet.</p>
        ) : (
          <div className="divide-y">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-6 py-3">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_TYPE_LABEL[d.documentType]} · v{d.version} ·{" "}
                    {fmtDate(d.uploadedDate)}
                    {d.uploadedBy ? ` · ${d.uploadedBy}` : ""}
                  </p>
                </div>
                {d.fileUrl && (
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
