"use client";

import * as React from "react";
import { Plus, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { createContact } from "@/lib/actions";
import { CONTACT_ROLE_LABEL } from "@/lib/constants";
import type { Contact, ContactRole } from "@prisma/client";

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

export function ContactsClient({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [filter, setFilter] = React.useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createContact(fd);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  const filtered = filter ? contacts.filter((c) => c.role === filter) : contacts;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <NativeSelect
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:w-56"
        >
          <option value="">All roles</option>
          {(Object.keys(CONTACT_ROLE_LABEL) as ContactRole[]).map((r) => (
            <option key={r} value={r}>
              {CONTACT_ROLE_LABEL[r]}
            </option>
          ))}
        </NativeSelect>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="mb-1.5 block">Company name</Label>
                    <Input name="companyName" required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Contact person</Label>
                    <Input name="contactPerson" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Role</Label>
                    <NativeSelect name="role" defaultValue="ARCHITECT">
                      {(Object.keys(CONTACT_ROLE_LABEL) as ContactRole[]).map((r) => (
                        <option key={r} value={r}>
                          {CONTACT_ROLE_LABEL[r]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Phone</Label>
                    <Input name="phone" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Email</Label>
                    <Input name="email" type="email" />
                  </div>
                  <div className="col-span-2">
                    <Label className="mb-1.5 block">Address</Label>
                    <Input name="address" />
                  </div>
                  <div className="col-span-2">
                    <Label className="mb-1.5 block">Notes</Label>
                    <Textarea name="notes" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Create contact"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {c.companyName}
                </div>
                <ToneBadge tone="grey" label={CONTACT_ROLE_LABEL[c.role]} dot={false} />
              </div>
              {c.contactPerson && (
                <p className="text-sm text-muted-foreground">{c.contactPerson}</p>
              )}
              <div className="space-y-1 text-sm text-muted-foreground">
                {c.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {c.phone}
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {c.email}
                  </p>
                )}
                {c.address && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {c.address}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No contacts found.
        </p>
      )}
    </div>
  );
}
