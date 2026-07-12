"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNote } from "@/lib/actions";
import { fmtDateTime } from "@/lib/dates";
import { StickyNote } from "lucide-react";
import type { Note } from "@/lib/client-types";

export function NotesPanel({ projectId, notes }: { projectId: string; notes: Note[] }) {
  const [pending, setPending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addNote(projectId, fd);
      formRef.current?.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <StickyNote className="h-4 w-4" /> Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-2">
          <Textarea name="content" placeholder="Add a note…" required />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Adding…" : "Add note"}
            </Button>
          </div>
        </form>
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm">{n.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {n.createdBy ? `${n.createdBy} · ` : ""}
                {fmtDateTime(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
