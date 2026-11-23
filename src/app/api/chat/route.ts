import { NextResponse } from "next/server";
import { chatSchema } from "@/lib/validation";
import { answerQuery } from "@/lib/rag";
import {
  addAudit, addMessage, createConversation, getConversation,
} from "@/lib/db";
import { currentUser } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const limit = rateLimit(`chat:${user.id}:${clientIp(req)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: `Slow down — try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { message, securityOn } = parsed.data;

  // Resolve / create conversation (owned by this user).
  let conversationId = parsed.data.conversationId;
  let createdTitle: string | undefined;
  if (conversationId) {
    const conv = await getConversation(conversationId);
    if (!conv || conv.userId !== user.id) conversationId = undefined;
  }
  if (!conversationId) {
    const title = message.length > 48 ? message.slice(0, 48) + "…" : message;
    const conv = await createConversation(user.id, title);
    conversationId = conv.id;
    createdTitle = conv.title;
  }

  await addMessage({ conversationId, role: "user", content: message, securityOn });

  const result = await answerQuery({ query: message, role: user.role, securityOn });

  await addMessage({
    conversationId, role: "assistant", content: result.answer,
    citations: result.citations, events: result.events, securityOn,
  });

  await addAudit({
    userId: user.id, role: user.role, query: message, securityOn,
    verdict: result.events.inputBlocked ? "block" : "allow", events: result.events,
  });

  return NextResponse.json({ ...result, conversationId, conversationTitle: createdTitle });
}
