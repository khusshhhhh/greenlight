"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { login, signup, type AuthState } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

function PasswordField({ mode }: { mode: "login" | "signup" }) {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <Label htmlFor="password" className="mb-1.5 block">
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          className="pr-10"
          placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Spinner /> Please wait…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction] = useFormState<AuthState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {mode === "signup" && (
        <div>
          <Label htmlFor="name" className="mb-1.5 block">
            Full name
          </Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="Jane Smith" />
        </div>
      )}

      <div>
        <Label htmlFor="email" className="mb-1.5 block">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com.au"
        />
      </div>

      <PasswordField mode={mode} />

      <SubmitButton label={mode === "login" ? "Log in" : "Create account"} />

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New to Greenlight?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
