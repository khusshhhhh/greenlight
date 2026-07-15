"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { signIn, signOut } from "./auth";
import { provisionNewUser } from "./provision";
import { checkRateLimit } from "./rate-limit";

// Password: 8–72 chars (bcrypt only uses the first 72 bytes), and must contain
// at least one letter and one number.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

const signupSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(120),
  email: z.string().email("Enter a valid email").max(254),
  password: passwordSchema,
});

export type AuthState = { error?: string } | undefined;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  const rl = checkRateLimit(`login:${email}`, 8, 60_000);
  if (!rl.ok) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Deliberately generic — no account-existence disclosure.
      return { error: "Invalid email or password." };
    }
    throw error; // re-throw redirect
  }
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const rl = checkRateLimit(`signup:${email}`, 5, 60_000);
  if (!rl.ok) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: parsed.data.name.trim(), email, passwordHash, role: "ADMIN" },
    });
    await provisionNewUser(tx, user.id);
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
