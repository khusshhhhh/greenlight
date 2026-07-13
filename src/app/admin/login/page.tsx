import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Greenlight" };

export default function AdminLoginPage() {
  if (isAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-6 flex items-center gap-2 text-lg font-bold tracking-tight">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        Greenlight Admin
      </div>
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Admin console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restricted access — administrators only.
          </p>
        </div>
        <AdminLoginForm />
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        This area is separate from user accounts.
      </p>
    </div>
  );
}
