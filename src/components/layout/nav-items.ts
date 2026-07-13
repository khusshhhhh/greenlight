import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileWarning,
  CalendarDays,
  Settings,
} from "lucide-react";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/rfis", label: "RFIs", icon: FileWarning },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
