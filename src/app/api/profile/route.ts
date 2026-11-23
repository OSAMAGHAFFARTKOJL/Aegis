import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { profileSchema } from "@/lib/validation";
import { getUserById, updateUserName, updateUserPassword } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sessionUser = await currentUser();
  if (!sessionUser) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const user = await getUserById(sessionUser.id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (parsed.data.name && parsed.data.name !== user.name) {
    await updateUserName(user.id, parsed.data.name);
  }

  if (parsed.data.newPassword) {
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account signs in with Google/GitHub and has no password to change." },
        { status: 400 },
      );
    }
    const ok = await bcrypt.compare(parsed.data.currentPassword ?? "", user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    await updateUserPassword(user.id, parsed.data.newPassword);
  }

  return NextResponse.json({ ok: true });
}
