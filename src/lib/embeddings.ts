// ---------------------------------------------------------------------------
// Embeddings via Google Gemini (gemini-embedding-2). Used to vectorize document
// chunks and queries for semantic retrieval. Returns null on failure so the RAG
// layer can fall back to keyword overlap.
// ---------------------------------------------------------------------------

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Fixed embedding size so the sqlite-vec index has a stable dimension.
export const EMBED_DIM = 768;

export function embeddingsEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Pack a vector into the little-endian Float32 bytes sqlite-vec expects. */
export function packVector(vec: number[]): Uint8Array {
  return new Uint8Array(new Float32Array(vec).buffer);
}

export async function embed(text: string): Promise<number[] | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-2";
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(`${BASE}/${model}:embedContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text: text.slice(0, 8000) }] },
        outputDimensionality: EMBED_DIM,
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      console.error("[Aegis] embed error:", res.status, (await res.text().catch(() => "")).slice(0, 160));
      return null;
    }
    const data = await res.json();
    const values = data?.embedding?.values;
    return Array.isArray(values) ? (values as number[]) : null;
  } catch (err) {
    console.error("[Aegis] embed request failed:", err);
    return null;
  }
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Keyword-overlap score, used when embeddings are unavailable. */
export function keywordScore(query: string, text: string): number {
  const q = new Set(tokenize(query));
  if (q.size === 0) return 0;
  const t = tokenize(text);
  let hits = 0;
  for (const w of t) if (q.has(w)) hits++;
  return hits / Math.sqrt(t.length + 1);
}

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
}
