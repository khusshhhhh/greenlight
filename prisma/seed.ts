import { PrismaClient, type Contact, type ContactRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createDefaultWorkflows } from "../src/lib/project-setup";
import { provisionNewUser } from "../src/lib/provision";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding Greenlight…");

  // --- Reset (dev only) ---------------------------------------------------
  await prisma.activityLog.deleteMany();
  await prisma.note.deleteMany();
  await prisma.document.deleteMany();
  await prisma.rFI.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.projectContact.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.council.deleteMany();
  await prisma.taskDurationSetting.deleteMany();

  // --- Demo account -------------------------------------------------------
  // Log in with:  demo@greenlight.app  /  demo12345
  const passwordHash = await bcrypt.hash("demo12345", 10);
  const demo = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@greenlight.app",
      passwordHash,
      role: "ADMIN",
      // Pre-activated subscription so the demo login can access the app
      // without going through Stripe checkout.
      stripeStatus: "active",
      stripeCurrentPeriodEnd: addDays(new Date(), 365),
    },
  });

  // Two extra staff members to use as assignees / RFI owners.
  const [sarah, james] = await Promise.all([
    prisma.user.create({
      data: { name: "Sarah Mitchell", email: "sarah@greenlight.app", role: "MANAGER" },
    }),
    prisma.user.create({
      data: { name: "James Chen", email: "james@greenlight.app", role: "STAFF" },
    }),
  ]);

  // Provision the demo account with its own councils + default task durations.
  await provisionNewUser(prisma, demo.id);

  // --- Contacts -----------------------------------------------------------
  const contactSpecs: { role: ContactRole; companies: [string, string][] }[] = [
    {
      role: "ARCHITECT",
      companies: [
        ["Studio 9 Architects", "Olivia Bennett"],
        ["Adelaide Design House", "Marcus Reed"],
        ["Northline Architecture", "Priya Nair"],
        ["Coastline Drafting Co", "Daniel Foster"],
        ["Willow & Grey Studio", "Hannah Lowe"],
      ],
    },
    {
      role: "ENGINEER",
      companies: [
        ["Torrens Structural Engineers", "Ben Carter"],
        ["SA Civil & Structural", "Aisha Khan"],
        ["Precision Engineering Group", "Tom Whitfield"],
        ["Baseline Consulting Engineers", "Grace Sullivan"],
        ["Fortis Structural", "Leo Martins"],
      ],
    },
    {
      role: "SURVEYOR",
      companies: [
        ["Alignment Surveys", "Rachel Green"],
        ["Datum Point Surveyors", "Michael Tran"],
        ["Meridian Land Surveys", "Sophie Adams"],
      ],
    },
    {
      role: "LAND_DIVISION_COMPANY",
      companies: [
        ["DivideCo Land Division", "Peter Kowalski"],
        ["Boundary Solutions SA", "Emma Robinson"],
        ["Titan Land Division", "Nathan Brooks"],
      ],
    },
    {
      role: "TAKE_OFF_COMPANY",
      companies: [
        ["QuantiFrame Take-Offs", "Chris Palmer"],
        ["Timberline Estimating", "Julia Ford"],
        ["Accurate Take-Off Services", "Ryan Cole"],
      ],
    },
    {
      role: "PRIVATE_CERTIFIER",
      companies: [
        ["CertifySA Building Consultants", "David Wong"],
        ["Approval Partners Certification", "Laura Hughes"],
        ["BuildRight Private Certifiers", "Simon Blake"],
      ],
    },
    {
      role: "COUNCIL_CONTACT",
      companies: [
        ["City of Playford — Planning", "Karen Doyle"],
        ["City of Onkaparinga — Development", "Alan Pierce"],
      ],
    },
  ];

  const contacts: Contact[] = [];
  for (const spec of contactSpecs) {
    for (const [companyName, contactPerson] of spec.companies) {
      const c = await prisma.contact.create({
        data: {
          ownerId: demo.id,
          companyName,
          contactPerson,
          role: spec.role,
          phone: `08 8${Math.floor(100 + Math.random() * 899)} ${Math.floor(1000 + Math.random() * 8999)}`,
          email: `${contactPerson.split(" ")[0].toLowerCase()}@${companyName
            .toLowerCase()
            .replace(/[^a-z]/g, "")
            .slice(0, 12)}.com.au`,
          address: "Adelaide SA 5000",
        },
      });
      contacts.push(c);
    }
  }

  const byRole = (role: ContactRole) => contacts.filter((c) => c.role === role);

  // --- Projects -----------------------------------------------------------
  const projectSeeds = [
    {
      name: "Seaford Rise — 4 Unit Development",
      address: "12 Seaview Road, Seaford Rise SA 5169",
      clientName: "Coastline Property Group",
      clientPhone: "0412 345 678",
      clientEmail: "invest@coastlinepg.com.au",
      lotNumber: "Lot 45 DP 12345",
      council: "City of Onkaparinga",
      applicationNumber: "APP-2026-0412",
      planSAReference: "24000412",
      priority: "HIGH" as const,
      status: "ACTIVE" as const,
      assigneeId: sarah.id,
      startDate: subDays(new Date(), 40),
      notes: "Fast-tracked. Client wants titles before end of financial year.",
    },
    {
      name: "Munno Para — Torrens Title Division",
      address: "8 Curtis Road, Munno Para SA 5115",
      clientName: "Playford Developments Pty Ltd",
      clientPhone: "0421 987 654",
      clientEmail: "projects@playforddev.com.au",
      lotNumber: "Lot 102 FP 998877",
      council: "City of Playford",
      applicationNumber: "APP-2026-0388",
      planSAReference: "24000388",
      priority: "MEDIUM" as const,
      status: "ACTIVE" as const,
      assigneeId: james.id,
      startDate: subDays(new Date(), 18),
      notes: "Standard two-into-three land division with a new dwelling.",
    },
    {
      name: "Aldinga Beach — Dual Occupancy",
      address: "3 Rowley Road, Aldinga Beach SA 5173",
      clientName: "M. & K. Patel",
      clientPhone: "0433 112 233",
      clientEmail: "patel.family@example.com",
      lotNumber: "Lot 7 DP 55221",
      council: "City of Onkaparinga",
      applicationNumber: "APP-2026-0301",
      planSAReference: "24000301",
      priority: "URGENT" as const,
      status: "ACTIVE" as const,
      assigneeId: sarah.id,
      startDate: subDays(new Date(), 70),
      notes: "Planning approved. Now progressing BRC. Watch the RFI on setbacks.",
    },
  ];

  for (const [i, p] of projectSeeds.entries()) {
    const project = await prisma.project.create({ data: { ...p, ownerId: demo.id } });
    await createDefaultWorkflows(prisma, project.id, {
      startDate: p.startDate,
      ownerId: demo.id,
    });

    // Assign relevant contacts to each project.
    const assignments: ContactRole[] = [
      "ARCHITECT",
      "ENGINEER",
      "SURVEYOR",
      "PRIVATE_CERTIFIER",
      "COUNCIL_CONTACT",
    ];
    if (i !== 1) assignments.push("TAKE_OFF_COMPANY");
    assignments.push("LAND_DIVISION_COMPANY");

    for (const role of assignments) {
      const pool = byRole(role);
      if (!pool.length) continue;
      const contact = pool[i % pool.length];
      await prisma.projectContact.create({
        data: { projectId: project.id, contactId: contact.id, role },
      });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: project.id },
      orderBy: [{ workflowId: "asc" }, { sortOrder: "asc" }],
    });
    const taskByKey = new Map(tasks.map((t) => [t.templateKey, t]));

    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        action: "Project created",
        newValue: project.name,
        createdBy: p.assigneeId === james.id ? "James Chen" : "Sarah Mitchell",
      },
    });

    // Advance each project to a different stage so the dashboard has variety.
    if (i === 0) {
      // Seaford: early planning, a couple done, one overdue.
      await progress(taskByKey, "land-papers", "COMPLETED", -38);
      await progress(taskByKey, "contour-survey", "RECEIVED", -35, -14);
      await progress(taskByKey, "concept-plan", "IN_PROGRESS", -10);
      await overdue(taskByKey, "sd-plan", "REQUESTED", -12); // overdue
      await addRfi(project.id, "PLANNING", 1, byRole("ARCHITECT")[0]?.id, james.id, true);
    }

    if (i === 1) {
      // Munno Para: land division heavy, waiting on council.
      await progress(taskByKey, "send-job-ld", "COMPLETED", -16);
      await progress(taskByKey, "draft-ld-plan", "RECEIVED", -12, -9);
      await progress(taskByKey, "internal-approval-ld", "COMPLETED", -8);
      await progress(taskByKey, "lodge-ld", "LODGED", -6);
      await waiting(taskByKey, "wait-council-ld", "WAITING", -6);
      await progress(taskByKey, "land-papers", "COMPLETED", -17);
    }

    if (i === 2) {
      // Aldinga: planning approved, BRC underway, urgent RFI.
      for (const key of [
        "land-papers",
        "contour-survey",
        "concept-plan",
        "planning-drawings",
        "sd-plan",
        "lodge-planning",
        "planning-approval",
      ]) {
        await progress(taskByKey, key, key === "planning-approval" ? "APPROVED" : "COMPLETED", -60 + Math.floor(Math.random() * 20));
      }
      await progress(taskByKey, "working-drawings", "RECEIVED", -20, -8);
      await progress(taskByKey, "energy-rating", "IN_PROGRESS", -6);
      await overdue(taskByKey, "footing-report", "REQUESTED", -10); // overdue
      await progress(taskByKey, "take-offs", "IN_PROGRESS", -5);
      await addRfi(project.id, "DEVELOPMENT", 1, byRole("PRIVATE_CERTIFIER")[0]?.id, sarah.id, true);
      await addRfi(project.id, "PLANNING", 1, byRole("ENGINEER")[0]?.id, sarah.id, false);
    }

    // A document + a note per project.
    const anyTask = tasks[2];
    await prisma.document.create({
      data: {
        projectId: project.id,
        workflowType: "PLANNING",
        taskId: anyTask?.id,
        documentType: "CONCEPT_PLAN",
        name: `${project.name} — Concept Plan v1`,
        uploadedBy: "Sarah Mitchell",
        version: 1,
        fileUrl: null,
      },
    });
    await prisma.note.create({
      data: {
        projectId: project.id,
        content: "Kick-off call complete. Client to email land papers this week.",
        createdBy: "Sarah Mitchell",
      },
    });
  }

  console.log("✅  Seed complete.");
  console.log(`   Contacts: ${contacts.length} · Projects: ${projectSeeds.length}`);
  console.log("   Log in with:  demo@greenlight.app  /  demo12345");
}

// --- helpers --------------------------------------------------------------

type TaskMap = Map<string | null, { id: string }>;

async function progress(
  map: TaskMap,
  key: string,
  status: any,
  requestedOffset: number,
  completedOffset?: number
) {
  const t = map.get(key);
  if (!t) return;
  await prisma.task.update({
    where: { id: t.id },
    data: {
      status,
      requestedDate: addDays(new Date(), requestedOffset),
      completedDate:
        completedOffset != null ? addDays(new Date(), completedOffset) : new Date(),
    },
  });
}

async function overdue(map: TaskMap, key: string, status: any, requestedOffset: number) {
  const t = map.get(key);
  if (!t) return;
  await prisma.task.update({
    where: { id: t.id },
    data: {
      status,
      requestedDate: addDays(new Date(), requestedOffset),
      dueDate: addDays(new Date(), requestedOffset + 5), // already past
      completedDate: null,
    },
  });
}

async function waiting(map: TaskMap, key: string, status: any, requestedOffset: number) {
  const t = map.get(key);
  if (!t) return;
  await prisma.task.update({
    where: { id: t.id },
    data: {
      status,
      requestedDate: addDays(new Date(), requestedOffset),
      dueDate: addDays(new Date(), requestedOffset + 30),
    },
  });
}

async function addRfi(
  projectId: string,
  workflowType: any,
  rfiNumber: number,
  contactId: string | undefined,
  ownerId: string,
  open: boolean
) {
  await prisma.rFI.create({
    data: {
      projectId,
      workflowType,
      rfiNumber,
      title: `${workflowType === "PLANNING" ? "Planning" : "BRC"} RFI ${rfiNumber} — additional information requested`,
      description:
        "Council has requested clarification on stormwater management and boundary setbacks.",
      receivedFrom: "Council",
      responsibleContactId: contactId,
      internalOwnerId: ownerId,
      dateReceived: subDays(new Date(), 5),
      dueDate: addDays(new Date(), open ? 3 : -2),
      status: open ? "OPEN" : "CLOSED",
      responseReceivedDate: open ? null : subDays(new Date(), 1),
      submittedDate: open ? null : new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
