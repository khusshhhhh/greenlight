import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ContactsClient } from "@/components/contacts-client";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const userId = await requireUserId();
  const contacts = await prisma.contact.findMany({
    where: { ownerId: userId },
    orderBy: [{ role: "asc" }, { companyName: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Architects, engineers, surveyors, certifiers, land division & council contacts."
      />
      <ContactsClient contacts={contacts} />
    </div>
  );
}
