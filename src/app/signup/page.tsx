import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign up — Greenlight" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking approvals in under a minute"
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
