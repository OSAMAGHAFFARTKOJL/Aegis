import { NextResponse } from "next/server";
import { renameSchema } from "@/lib/validation";
import { deleteConversation, getConversation, getMessages, renameConversation } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const runtime = "nodejs";

async function owned(id: string, userId: string) {
  const conv = await getConversation(id);
  return conv && conv.userId === userId ? conv : null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const conv = await owned(params.id, user.id);
  if (!conv) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ conversation: conv, messages: await getMessages(params.id) });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!(await owned(params.id, user.id))) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const parsed = renameSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid title." }, { status: 400 });
  await renameConversation(params.id, parsed.data.title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!(await owned(params.id, user.id))) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await deleteConversation(params.id);
  return NextResponse.json({ ok: true });
}
