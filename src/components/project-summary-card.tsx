import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/status-badge";
import { fmtDate } from "@/lib/dates";
import {
  MapPin,
  User,
  Phone,
  Mail,
  Landmark,
  Hash,
  FileText,
  Calendar,
  UserCog,
  BedDouble,
  Bath,
  ShowerHead,
  Sofa,
  Car,
  Building,
  UserCheck,
} from "lucide-react";
import type { Project, User as UserModel } from "@prisma/client";

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ProjectSummaryCard({
  project,
}: {
  project: Project & { assignee: UserModel | null };
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Row icon={MapPin} label="Address" value={project.address} />
          <Row icon={User} label="Client" value={project.clientName} />
          <Row icon={Phone} label="Client phone" value={project.clientPhone} />
          <Row icon={Mail} label="Client email" value={project.clientEmail} />
          <Row icon={Hash} label="Lot number" value={project.lotNumber} />
          <Row icon={Landmark} label="Council" value={project.council} />
          <Row icon={FileText} label="Application no." value={project.applicationNumber} />
          <Row icon={FileText} label="PlanSA reference" value={project.planSAReference} />
          <Row icon={Calendar} label="Start date" value={fmtDate(project.startDate)} />
          <Row icon={Calendar} label="Target completion" value={fmtDate(project.targetDate)} />
          <Row icon={UserCog} label="Assigned staff" value={project.assignee?.name} />
          <Row
            icon={UserCheck}
            label="Responsible stakeholder"
            value={
              project.stakeholderName
                ? [project.stakeholderName, project.stakeholderRole]
                    .filter(Boolean)
                    .join(" · ")
                : null
            }
          />
          <Row icon={Phone} label="Stakeholder contact" value={project.stakeholderContact} />
        </div>

        <DwellingDetails project={project} />

        {project.notes && (
          <div className="rounded-lg bg-muted/40 p-3 text-sm">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Notes</p>
            <p className="whitespace-pre-wrap">{project.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Spec({ icon: Icon, value, label }: { icon: any; value?: number | null; label: string }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function DwellingDetails({ project }: { project: Project }) {
  const hasAny =
    project.storeys != null ||
    project.bedrooms != null ||
    project.bathrooms != null ||
    project.showers != null ||
    project.livingAreas != null ||
    project.carSpaces != null;
  if (!hasAny) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Dwelling details</p>
      <div className="flex flex-wrap gap-2">
        {project.storeys && (
          <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1.5">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{project.storeys}</span>
            <span className="text-xs text-muted-foreground">storey</span>
          </div>
        )}
        <Spec icon={BedDouble} value={project.bedrooms} label="bed" />
        <Spec icon={Bath} value={project.bathrooms} label="bath" />
        <Spec icon={ShowerHead} value={project.showers} label="shower" />
        <Spec icon={Sofa} value={project.livingAreas} label="living" />
        <Spec icon={Car} value={project.carSpaces} label="car" />
      </div>
    </div>
  );
}
