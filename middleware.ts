import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe middleware: uses only the base config (no bcrypt / Prisma).
export default NextAuth(authConfig).auth;

export const config = {
  // Run on pages only. All API routes (auth, Stripe webhook, exports) do their
  // own auth/verification, so they're excluded from the redirecting middleware.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.png$).*)"],
};
