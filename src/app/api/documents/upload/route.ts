import { NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { addDocument } from "@/lib/db";
import { chunkText } from "@/lib/rag";
import { currentUser } from "@/lib/session";
import { canManageDocuments } from "@/lib/permissions";
import { ROLES, type Role } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!canManageDocuments(user.role)) {
    return NextResponse.json({ error: "Only HR and Admins can upload documents." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ error: "The file is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 413 });
  }

  const name = file.name || "document";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const buf = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    if (ext === "pdf") {
      const data = await pdfParse(buf);
      text = data.text;
    } else if (["txt", "md", "markdown", "csv", "log", "text"].includes(ext)) {
      text = buf.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, TXT, MD, or CSV." },
        { status: 415 },
      );
    }
  } catch (err) {
    console.error("[Aegis] file parse failed:", err);
    return NextResponse.json({ error: "Could not read that file." }, { status: 422 });
  }

  text = text.replace(/\u0000/g, "").trim();
  if (text.length < 1) {
    return NextResponse.json(
      { error: "No extractable text found (scanned PDFs aren't supported)." },
      { status: 422 },
    );
  }

  const title = (form.get("title")?.toString().trim() || name.replace(/\.[^.]+$/, "")).slice(0, 120);
  const rolesRaw = (form.get("allowedRoles")?.toString() ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter((r): r is Role => (ROLES as string[]).includes(r));
  const allowedRoles = rolesRaw.length ? rolesRaw : (["employee", "hr", "admin"] as Role[]);

  const doc = await addDocument({
    title,
    source: `upload:${ext}`,
    ownerId: user.id,
    allowedRoles,
    chunks: chunkText(text),
  });

  return NextResponse.json({ document: doc, chars: text.length }, { status: 201 });
}
