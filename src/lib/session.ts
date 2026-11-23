import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Role } from "./types";

export interface SessionUser {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function currentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user;
  if (!u?.id) return null;
  return {
    id: u.id,
    role: (u.role ?? "employee") as Role,
    name: u.name,
    email: u.email,
    image: u.image,
  };
}

export async function currentUserId(): Promise<string | null> {
  return (await currentUser())?.id ?? null;
}
