import {
  Users,
  FolderKanban,
  ListChecks,
  FileWarning,
  AlarmClock,
  CreditCard,
  UserPlus,
  ShieldCheck,
  Contact,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { adminLogout } from "@/lib/admin-actions";
import { getAdminStats } from "@/lib/admin-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { fmtDate } from "@/lib/dates";
import type { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin dashboard · Greenlight" };

const ICONS = {
  Users,
  FolderKanban,
  ListChecks,
  FileWarning,
  AlarmClock,
  CreditCard,
  UserPlus,
  Contact,
} as const;

function Stat({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof ICONS;
  hint?: string;
}) {
  const Icon = ICONS[icon];
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  requireAdmin();
  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            Greenlight Admin
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={adminLogout}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggregate metrics across all accounts. No individual project details are shown.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total users" value={stats.totalUsers} icon="Users" hint={`${stats.newUsers30} new in 30 days`} />
          <Stat label="Active subscribers" value={stats.activeSubscribers} icon="CreditCard" />
          <Stat label="Total projects" value={stats.totalProjects} icon="FolderKanban" />
          <Stat label="Total tasks" value={stats.totalTasks} icon="ListChecks" hint={`${stats.completionRate}% completed`} />
          <Stat label="Open RFIs" value={stats.openRfis} icon="FileWarning" />
          <Stat label="Overdue tasks" value={stats.overdueTasks} icon="AlarmClock" />
          <Stat label="Contacts" value={stats.totalContacts} icon="Contact" />
          <Stat label="New users (30d)" value={stats.newUsers30} icon="UserPlus" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projects by status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.perStatus.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              )}
              {stats.perStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {PROJECT_STATUS_LABEL[s.status as ProjectStatus]}
                  </span>
                  <span className="font-semibold">{s.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Accounts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Account</th>
                      <th className="px-4 py-2 font-medium">Projects</th>
                      <th className="px-4 py-2 font-medium">Contacts</th>
                      <th className="px-4 py-2 font-medium">Plan</th>
                      <th className="px-4 py-2 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.accounts.map((a) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.email}</div>
                        </td>
                        <td className="px-4 py-2.5 font-medium">{a.projects}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{a.contacts}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={
                              a.subscribed
                                ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            }
                          >
                            {a.subscribed ? "Active" : "Free"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(a.joined)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          🔒 Privacy: this console shows account-level counts only. Project names,
          addresses, client information, tasks and documents are never accessible here.
        </p>
      </main>
    </div>
  );
}
