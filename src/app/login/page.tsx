import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Log in — Greenlight" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your Greenlight workspace">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
