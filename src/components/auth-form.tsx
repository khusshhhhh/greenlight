"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { login, signup, type AuthState } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Please wait…" : label}
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

      <div>
        <Label htmlFor="password" className="mb-1.5 block">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
        />
      </div>

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
