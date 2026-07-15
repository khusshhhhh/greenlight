"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, SlidersHorizontal, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ProjectCard, type ProjectCardData } from "@/components/project-card";
import { PROJECT_STATUS_LABEL, enumOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@prisma/client";

type SortKey = "updated" | "name" | "progress" | "overdue" | "created";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name (A–Z)" },
  { value: "progress", label: "Progress (high → low)" },
  { value: "overdue", label: "Most overdue" },
  { value: "created", label: "Newest first" },
];

const nativeSelect =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto";

export function ProjectsExplorer({
  projects,
  councils,
  initialQuery = "",
}: {
  projects: ProjectCardData[];
  councils: string[];
  initialQuery?: string;
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [status, setStatus] = React.useState<string>("");
  const [council, setCouncil] = React.useState<string>("");
  const [flag, setFlag] = React.useState<string>("");
  const [sort, setSort] = React.useState<SortKey>("updated");
  const [pending, setPending] = React.useState(false);

  // Brief loading pulse while the user is actively typing.
  React.useEffect(() => {
    if (query === "") {
      setPending(false);
      return;
    }
    setPending(true);
    const t = setTimeout(() => setPending(false), 280);
    return () => clearTimeout(t);
  }, [query]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (status && p.status !== status) return false;
      if (council && p.council !== council) return false;
      if (flag === "overdue" && (p._overdue ?? 0) === 0) return false;
      if (flag === "rfi" && (p._openRfis ?? 0) === 0) return false;
      if (q) {
        const hay = `${p.name} ${p.address ?? ""} ${p.clientName ?? ""} ${p.council ?? ""} ${p.lotNumber ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return (b._progress ?? 0) - (a._progress ?? 0);
        case "overdue":
          return (b._overdue ?? 0) - (a._overdue ?? 0);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    return list;
  }, [projects, query, status, council, flag, sort]);

  const hasFilters = query !== "" || status !== "" || council !== "" || flag !== "";
  const clearAll = () => {
    setQuery("");
    setStatus("");
    setCouncil("");
    setFlag("");
    setSort("updated");
  };

  const filterSig = `${status}|${council}|${flag}|${sort}`;

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, address, client, council…"
            className="pl-9 pr-10"
            autoComplete="off"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {pending ? (
              <Spinner className="text-muted-foreground" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <span className="col-span-2 hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={nativeSelect}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {enumOptions<ProjectStatus>(PROJECT_STATUS_LABEL).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={council}
            onChange={(e) => setCouncil(e.target.value)}
            className={nativeSelect}
            aria-label="Filter by council"
          >
            <option value="">All councils</option>
            {councils.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            className={nativeSelect}
            aria-label="Filter by flag"
          >
            <option value="">No flag</option>
            <option value="overdue">Has overdue</option>
            <option value="rfi">Open RFI</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={cn(nativeSelect, "sm:ml-auto")}
            aria-label="Sort projects"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing <span className="font-medium text-foreground">{results.length}</span> of{" "}
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          {projects.length === 0 ? (
            <>
              <p>No projects yet.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/projects/new">
                  <Plus className="h-4 w-4" /> Create your first project
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p>No projects match your search.</p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>
                Clear filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div
          key={filterSig}
          className={cn(
            "gl-rise grid grid-cols-1 gap-4 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3",
            pending && "opacity-70"
          )}
        >
          {results.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
