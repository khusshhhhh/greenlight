import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, ProjectCardSkeleton } from "@/components/skeletons";

export default function ProjectsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mb-5 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-52" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
