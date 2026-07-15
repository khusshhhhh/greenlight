"use client";

import * as React from "react";
import { Plus, X, Building2, Phone } from "lucide-react";
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
import { ToneBadge } from "@/components/status-badge";
import { addProjectEntity, removeProjectEntity } from "@/lib/actions";
import { RESPONSIBLE_ENTITY_TYPES } from "@/lib/constants";
import { toast } from "@/components/ui/toast";
import type { ProjectEntity } from "@prisma/client";

const nativeSelect =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ResponsibleEntitiesPanel({
  projectId,
  entities,
}: {
  projectId: string;
  entities: ProjectEntity[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [type, setType] = React.useState(RESPONSIBLE_ENTITY_TYPES[0]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addProjectEntity(projectId, fd);
      toast.success("Entity added");
      setOpen(false);
      setType(RESPONSIBLE_ENTITY_TYPES[0]);
    } catch (err) {
      toast.error("Couldn't add entity", err instanceof Error ? err.message : undefined);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Responsible entities</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add responsible entity</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Entity type</Label>
                <select
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={nativeSelect}
                >
                  {RESPONSIBLE_ENTITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {type === "Other" && (
                <div>
                  <Label className="mb-1.5 block">Custom type</Label>
                  <Input name="customType" placeholder="e.g. Geotechnical Consultant" required />
                </div>
              )}

              <div>
                <Label className="mb-1.5 block">Company / person name</Label>
                <Input name="name" required placeholder="e.g. Studio 9 Architects" />
              </div>
              <div>
                <Label className="mb-1.5 block">Contact (phone or email)</Label>
                <Input name="contact" placeholder="Optional" />
              </div>
              <div>
                <Label className="mb-1.5 block">Notes</Label>
                <Textarea name="notes" placeholder="Optional" />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Adding…" : "Add entity"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {entities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No responsible entities yet. Add architects, engineers, surveyors, certifiers and more.
          </p>
        )}
        {entities.map((ent) => (
          <div key={ent.id} className="flex items-start justify-between gap-2 rounded-lg border p-3">
            <div className="min-w-0">
              <ToneBadge tone="blue" label={ent.type} dot={false} />
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {ent.name}
              </p>
              {ent.contact && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {ent.contact}
                </p>
              )}
              {ent.notes && <p className="mt-0.5 text-xs text-muted-foreground">{ent.notes}</p>}
            </div>
            <RemoveButton id={ent.id} projectId={projectId} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RemoveButton({ id, projectId }: { id: string; projectId: string }) {
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0 text-muted-foreground"
      disabled={pending}
      onClick={() =>
        startTransition(() =>
          removeProjectEntity(id, projectId).then(() => toast.success("Entity removed"))
        )
      }
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
