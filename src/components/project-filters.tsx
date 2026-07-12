"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_LABEL, enumOptions } from "@/lib/constants";
import type { ProjectStatus } from "@prisma/client";

const ALL = "__all__";

export function ProjectFilters({ councils }: { councils: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    router.push(`/projects?${next.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder="Search name or address…"
          className="pl-9"
          onChange={(e) => set("q", e.target.value)}
        />
      </div>

      <Select value={params.get("status") ?? ALL} onValueChange={(v) => set("status", v)}>
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {enumOptions<ProjectStatus>(PROJECT_STATUS_LABEL).map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={params.get("council") ?? ALL} onValueChange={(v) => set("council", v)}>
        <SelectTrigger className="sm:w-52">
          <SelectValue placeholder="Council" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All councils</SelectItem>
          {councils.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={params.get("flag") ?? ALL} onValueChange={(v) => set("flag", v)}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>No filter</SelectItem>
          <SelectItem value="overdue">Has overdue</SelectItem>
          <SelectItem value="rfi">Open RFI</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
