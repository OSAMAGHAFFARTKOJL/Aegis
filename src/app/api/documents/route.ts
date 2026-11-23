import { NextResponse } from "next/server";
import { documentSchema } from "@/lib/validation";
import { addDocument, listDocuments } from "@/lib/db";
import { chunkText } from "@/lib/rag";
import { currentUser } from "@/lib/session";
import { canManageDocuments } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const manage = canManageDocuments(user.role);
  const all = await listDocuments();
  // Employees only see documents their role is permitted to access.
  const documents = manage ? all : all.filter((d) => d.allowedRoles.includes(user.role));
  return NextResponse.json({ documents, canManage: manage });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!canManageDocuments(user.role)) {
    return NextResponse.json(
      { error: "Only HR and Admins can add documents." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const doc = await addDocument({
    title: parsed.data.title,
    source: "paste",
    ownerId: user.id,
    allowedRoles: parsed.data.allowedRoles,
    chunks: chunkText(parsed.data.content),
  });
  return NextResponse.json({ document: doc }, { status: 201 });
}
