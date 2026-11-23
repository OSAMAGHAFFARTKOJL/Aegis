import { NextResponse } from "next/server";
import { deleteDocument, getDocument, getDocumentChunks } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { canManageDocuments } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const doc = await getDocument(params.id);
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  // Employees can only preview documents their role is allowed to see.
  if (!canManageDocuments(user.role) && !doc.allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "You don't have access to this document." }, { status: 403 });
  }
  const chunks = await getDocumentChunks(params.id);
  return NextResponse.json({ document: doc, chunks });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!canManageDocuments(user.role)) {
    return NextResponse.json({ error: "Only HR and Admins can delete documents." }, { status: 403 });
  }
  await deleteDocument(params.id);
  return NextResponse.json({ ok: true });
}
