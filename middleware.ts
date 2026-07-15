import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe middleware: uses only the base config (no bcrypt / Prisma).
// Route protection lives in authConfig.callbacks.authorized; security headers
// and the Content-Security-Policy are set in next.config.mjs.
export default NextAuth(authConfig).auth;

export const config = {
  // Pages only — API routes (auth, Stripe webhook, exports) self-verify.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.png$).*)"],
};
