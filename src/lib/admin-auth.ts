import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Standalone admin authentication — completely separate from user accounts.
 * A signed (HMAC) cookie proves admin status. Credentials come from env:
 *   ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SECRET
 */

export const ADMIN_COOKIE = "gl_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 4; // 4 hours

function secret(): string {
  return process.env.ADMIN_SECRET ?? "dev-admin-secret-change-me";
}

export function makeAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp: Date.now() + ADMIN_MAX_AGE * 1000 })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verify(token?: string): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

/** Constant-time credential check against the env config. */
export function checkAdminCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return false;
  const uOk =
    username.length === u.length &&
    crypto.timingSafeEqual(Buffer.from(username), Buffer.from(u));
  const pOk =
    password.length === p.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(p));
  return uOk && pOk;
}

export function isAdmin(): boolean {
  return verify(cookies().get(ADMIN_COOKIE)?.value);
}

export function requireAdmin(): void {
  if (!isAdmin()) redirect("/admin/login");
}
