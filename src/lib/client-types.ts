import type {
  Task,
  Contact,
  RFI,
  Document,
  Note,
  ActivityLog,
  ProjectContact,
} from "@prisma/client";

export type TaskWithRelations = Task & {
  contact: Contact | null;
  variations: (Task & { contact: Contact | null })[];
};

export type ContactOption = Pick<Contact, "id" | "companyName" | "contactPerson" | "role">;

export type RfiWithRelations = RFI & {
  responsibleContact: Pick<Contact, "id" | "companyName"> | null;
};

export type ProjectContactWithContact = ProjectContact & { contact: Contact };

export type { Document, Note, ActivityLog };
