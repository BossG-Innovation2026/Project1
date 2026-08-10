import { cookies } from "next/headers";
import { getAuth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;
  const session = await getAuth().api.getSession({
    headers: new Headers({ cookie: cookieHeader }),
  });
  if (!session?.user) return null;
  return session.user as SessionUser;
}
