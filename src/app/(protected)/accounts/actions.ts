"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "better-auth/crypto";
import { queryOne, queryAll, runSql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  MODULES,
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  isAdmin,
  rolesCreatableBy,
  type ModuleKey,
} from "@/lib/modules";

export interface ActionState {
  error?: string;
  ok?: boolean;
}

export interface AccountRow {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  active: number;
  createdAt: number;
}

async function currentAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) return null;
  return user;
}

function parseModules(formData: FormData): ModuleKey[] {
  const picked = formData.getAll("modules") as string[];
  return MODULES.filter((m) => picked.includes(m.key)).map((m) => m.key);
}

async function loadAccount(id: string): Promise<AccountRow | undefined> {
  return queryOne<AccountRow>(
    `SELECT id, name, email, role, permissions, active, createdAt
     FROM user WHERE id = ?`,
    id
  );
}

export async function createAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await currentAdmin();
  if (!actor) return { error: "You are not authorized to create accounts." };

  const role = String(formData.get("role") ?? "");
  if (!rolesCreatableBy(actor).includes(role)) {
    return { error: "You cannot create accounts with this role." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Name is required." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const modules = parseModules(formData);
  if (role === ROLE_ADMIN && !modules.includes("accounts")) modules.push("accounts");

  const existing = await queryOne<{ id: string }>("SELECT id FROM user WHERE email = ?", email);
  if (existing) return { error: "An account with this email already exists." };

  const now = Date.now();
  const id = randomUUID();
  const passwordHash = await hashPassword(password);

  await runSql(
    `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role, permissions, active)
     VALUES (?, ?, ?, 1, ?, ?, ?, ?, 1)`,
    id,
    name,
    email,
    now,
    now,
    role,
    JSON.stringify(modules)
  );
  await runSql(
    `INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
     VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
    randomUUID(),
    id,
    id,
    passwordHash,
    now,
    now
  );

  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function updatePermissions(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await currentAdmin();
  if (!actor) return { error: "You are not authorized." };
  const target = await loadAccount(id);
  if (!target) return { error: "Account not found." };

  const editingSelf = actor.id === id;
  const canManageAdmin = actor.role === ROLE_SUPER_ADMIN;
  if (target.role === ROLE_ADMIN && !editingSelf && !canManageAdmin) {
    return { error: "Only the super admin can manage admin accounts." };
  }
  if (target.role === ROLE_SUPER_ADMIN && !canManageAdmin) {
    return { error: "Only the super admin can manage this account." };
  }

  const modules = parseModules(formData);
  if (editingSelf) {
    if (!modules.includes("accounts")) modules.push("accounts");
  }
  await runSql("UPDATE user SET permissions = ? WHERE id = ?", JSON.stringify(modules), id);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);
  return { ok: true };
}

export async function resetPassword(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await currentAdmin();
  if (!actor) return { error: "You are not authorized." };
  const target = await loadAccount(id);
  if (!target) return { error: "Account not found." };

  const canManageAdmin = actor.role === ROLE_SUPER_ADMIN;
  if (target.role === ROLE_ADMIN && actor.id !== id && !canManageAdmin) {
    return { error: "Only the super admin can manage admin accounts." };
  }
  if (target.role === ROLE_SUPER_ADMIN && actor.id !== id) {
    return { error: "Only the super admin can manage this account." };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const passwordHash = await hashPassword(password);
  await runSql(
    "UPDATE account SET password = ? WHERE providerId = 'credential' AND userId = ?",
    passwordHash,
    id
  );
  return { ok: true };
}

export async function setActive(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await currentAdmin();
  if (!actor) return { error: "You are not authorized." };
  const target = await loadAccount(id);
  if (!target) return { error: "Account not found." };

  if (actor.id === id) return { error: "You cannot deactivate your own account." };

  const canManageAdmin = actor.role === ROLE_SUPER_ADMIN;
  if (target.role === ROLE_ADMIN && !canManageAdmin) {
    return { error: "Only the super admin can manage admin accounts." };
  }
  if (target.role === ROLE_SUPER_ADMIN) {
    return { error: "The super admin account cannot be deactivated." };
  }

  const active = formData.get("active") === "1" ? 1 : 0;
  await runSql("UPDATE user SET active = ? WHERE id = ?", active, id);
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);
  return { ok: true };
}

export async function listAccounts(): Promise<AccountRow[]> {
  return queryAll<AccountRow>(
    `SELECT id, name, email, role, permissions, active, createdAt
     FROM user ORDER BY active DESC, name COLLATE NOCASE`
  );
}

export async function getAccount(id: string): Promise<AccountRow | undefined> {
  return loadAccount(id);
}
