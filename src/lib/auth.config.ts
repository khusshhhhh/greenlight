import type { NextAuthConfig } from "next-auth";

/**
 * Base Auth.js config shared by the middleware (edge runtime) and the full
 * server config. It must NOT import Node-only modules (bcrypt, Prisma) so it
 * stays edge-safe — those live in `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    /**
     * Route protection for middleware. Returns true to allow, false to bounce
     * to the sign-in page, or a redirect Response.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isPublic =
        path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/pricing") ||
        path.startsWith("/about") ||
        // Admin area has its own separate authentication (see lib/admin-auth).
        path.startsWith("/admin");

      if (isPublic) {
        // Signed-in users shouldn't sit on the auth screens.
        if (isLoggedIn && (path.startsWith("/login") || path.startsWith("/signup"))) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Everything else requires a session.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
