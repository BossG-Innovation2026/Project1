"use server";

import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { queryOne, runSql } from "@/lib/db";

export type RegisterState = { error?: string } | null;

export async function registerAccount(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter your full name and a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const auth = getAuth();
  const existing = await queryOne<{ c: number | bigint }>("SELECT COUNT(*) AS c FROM user");
  const isFirst = Number(existing?.c ?? 0) === 0;

  try {
    await auth.api.signUpEmail({ body: { name, email, password } });
  } catch {
    return { error: "Could not create the account. That email may already be registered." };
  }

  if (isFirst) {
    await runSql("UPDATE user SET role = 'super_admin', permissions = '[]' WHERE email = ?", email);
  } else {
    await runSql("UPDATE user SET role = 'teacher', permissions = '[]' WHERE email = ?", email);
  }

  redirect("/login?registered=1");
}