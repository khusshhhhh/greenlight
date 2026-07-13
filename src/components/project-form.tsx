"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { projectSchema, type ProjectFormValues } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROJECT_STATUS_LABEL, enumOptions } from "@/lib/constants";
import type { ProjectStatus } from "@prisma/client";

interface Props {
  councils: string[];
  defaultValues?: Partial<ProjectFormValues>;
  action: (fd: FormData) => Promise<void>;
  submitLabel?: string;
}

export function ProjectForm({ councils, defaultValues, action, submitLabel = "Create project" }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "ACTIVE",
      ...defaultValues,
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    setPending(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => v != null && fd.set(k, String(v)));
    try {
      await action(fd);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Project name" error={errors.name?.message} className="sm:col-span-2">
            <Input {...register("name")} placeholder="e.g. Seaford Rise — 4 Unit Development" />
          </Field>
          <Field label="Project address" className="sm:col-span-2">
            <Input {...register("address")} placeholder="Street, suburb, SA postcode" />
          </Field>
          <Field label="Lot number">
            <Input {...register("lotNumber")} placeholder="Lot 45 DP 12345" />
          </Field>
          <Field label="Council">
            <input
              list="councils"
              {...register("council")}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Select or type a council"
            />
            <datalist id="councils">
              {councils.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Application number">
            <Input {...register("applicationNumber")} placeholder="APP-2026-0412" />
          </Field>
          <Field label="PlanSA reference">
            <Input {...register("planSAReference")} placeholder="24000412" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client name">
            <Input {...register("clientName")} />
          </Field>
          <Field label="Client phone">
            <Input {...register("clientPhone")} />
          </Field>
          <Field label="Client email" error={errors.clientEmail?.message}>
            <Input type="email" {...register("clientEmail")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule & status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status">
            <NativeSelect {...register("status")}>
              {enumOptions<ProjectStatus>(PROJECT_STATUS_LABEL).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Start date">
            <Input type="date" {...register("startDate")} />
          </Field>
          <Field label="Target completion date">
            <Input type="date" {...register("targetDate")} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea {...register("notes")} placeholder="Anything important about this project…" />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => (
  <select
    ref={ref}
    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    {...props}
  />
));
NativeSelect.displayName = "NativeSelect";
