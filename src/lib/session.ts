import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Returns the signed-in user's id, or redirects to /login.
 * Use in every server component / server action that touches tenant data.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
