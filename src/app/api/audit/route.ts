import { NextResponse } from "next/server";
import { listAudit } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  // Admins see all activity; everyone else sees their own.
  const entries = await listAudit(user.role === "admin" ? {} : { userId: user.id });
  return NextResponse.json({ entries });
}
