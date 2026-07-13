"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { adminLogin, type AdminAuthState } from "@/lib/admin-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Spinner /> Verifying…
        </>
      ) : (
        "Enter admin console"
      )}
    </Button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useFormState<AdminAuthState, FormData>(adminLogin, undefined);
  const [show, setShow] = React.useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div>
        <Label htmlFor="username" className="mb-1.5 block">
          Admin username
        </Label>
        <Input id="username" name="username" autoComplete="off" required />
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block">
          Admin password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="off"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Submit />
    </form>
  );
}
