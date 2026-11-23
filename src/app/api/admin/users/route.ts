import { NextResponse } from "next/server";
import { z } from "zod";
import { listUsers, setUserRole, getUserById } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { canManageUsers } from "@/lib/permissions";

export const runtime = "nodejs";

const changeSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["employee", "hr", "admin"]),
});

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const users = (await listUsers()).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!canManageUsers(user.role)) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = changeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  // Guard: an admin can't demote themselves (avoids locking out the last admin).
  if (parsed.data.userId === user.id && parsed.data.role !== "admin") {
    return NextResponse.json(
      { error: "You can't change your own admin role." },
      { status: 400 },
    );
  }
  const target = await getUserById(parsed.data.userId);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  await setUserRole(parsed.data.userId, parsed.data.role);
  return NextResponse.json({ ok: true, userId: parsed.data.userId, role: parsed.data.role });
}
