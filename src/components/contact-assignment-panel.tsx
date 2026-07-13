"use client";

import * as React from "react";
import { Plus, X, Building2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignContact, unassignContact } from "@/lib/actions";
import { toast } from "@/components/ui/toast";
import { CONTACT_ROLE_LABEL } from "@/lib/constants";
import type { ContactRole } from "@prisma/client";
import type { ProjectContactWithContact, ContactOption } from "@/lib/client-types";

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

export function ContactAssignmentPanel({
  projectId,
  assigned,
  allContacts,
}: {
  projectId: string;
  assigned: ProjectContactWithContact[];
  allContacts: ContactOption[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await assignContact(projectId, fd);
      toast.success("Contact assigned");
      setOpen(false);
    } catch {
      toast.error("Couldn't assign contact");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">External contacts</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Assign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign a contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Contact</Label>
                <NativeSelect name="contactId" required defaultValue="">
                  <option value="" disabled>
                    Select a contact…
                  </option>
                  {allContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({CONTACT_ROLE_LABEL[c.role]})
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label className="mb-1.5 block">Role on this project</Label>
                <NativeSelect name="role" required defaultValue="">
                  <option value="" disabled>
                    Select role…
                  </option>
                  {(Object.keys(CONTACT_ROLE_LABEL) as ContactRole[]).map((r) => (
                    <option key={r} value={r}>
                      {CONTACT_ROLE_LABEL[r]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Assigning…" : "Assign contact"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {assigned.length === 0 && (
          <p className="text-sm text-muted-foreground">No contacts assigned yet.</p>
        )}
        {assigned.map((pc) => (
          <div
            key={pc.id}
            className="flex items-start justify-between gap-2 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {CONTACT_ROLE_LABEL[pc.role]}
              </p>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {pc.contact.companyName}
              </p>
              {pc.contact.contactPerson && (
                <p className="text-sm text-muted-foreground">{pc.contact.contactPerson}</p>
              )}
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                {pc.contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {pc.contact.phone}
                  </span>
                )}
                {pc.contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {pc.contact.email}
                  </span>
                )}
              </div>
            </div>
            <UnassignButton id={pc.id} projectId={projectId} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UnassignButton({ id, projectId }: { id: string; projectId: string }) {
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0 text-muted-foreground"
      disabled={pending}
      onClick={() =>
        startTransition(() =>
          unassignContact(id, projectId).then(() => toast.success("Contact removed"))
        )
      }
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
