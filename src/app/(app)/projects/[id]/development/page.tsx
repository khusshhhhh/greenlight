import { WorkflowSubPage } from "@/components/workflow-subpage";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { id: string } }) {
  return <WorkflowSubPage id={params.id} type="DEVELOPMENT" />;
}
