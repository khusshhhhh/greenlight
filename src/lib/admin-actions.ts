"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  checkAdminCredentials,
  makeAdminToken,
} from "./admin-auth";
import { checkRateLimit } from "./rate-limit";

export type AdminAuthState = { error?: string } | undefined;

export async function adminLogin(
  _prev: AdminAuthState,
  fd: FormData
): Promise<AdminAuthState> {
  const username = String(fd.get("username") ?? "");
  const password = String(fd.get("password") ?? "");

  // Throttle admin login attempts (5 per minute).
  const rl = checkRateLimit("admin-login", 5, 60_000);
  if (!rl.ok) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return { error: "Admin access is not configured on the server." };
  }
  if (!checkAdminCredentials(username, password)) {
    return { error: "Invalid admin credentials." };
  }

  cookies().set(ADMIN_COOKIE, makeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  redirect("/admin");
}

export async function adminLogout() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
