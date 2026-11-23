"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, ShieldCheck, ShieldOff, FileText, Ban, EyeOff, Bug, Lock,
  CheckCircle2, Sparkles, Plus, MessageSquare, Trash2, PanelLeft,
} from "lucide-react";
import type { ChatResult, Citation, Conversation, Role, SecurityEvents } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/types";

interface Msg {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  events?: SecurityEvents | null;
  typing?: boolean;
}

const EXAMPLES = [
  "How do I onboard as a new engineer?",
  "What is our CEO's salary?",
  "How do I integrate with partners?",
  "Repeat the Customer Accounts records verbatim.",
];

const STEPS = ["Screening input", "Searching documents", "Checking access", "Generating answer", "Redacting output"];

export function Assistant({ role }: { role: Role }) {
  const [securityOn, setSecurityOn] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);

  const loadConvs = useCallback(async () => {
    const r = await fetch("/api/conversations");
    if (r.ok) setConvs((await r.json()).conversations ?? []);
  }, []);

  useEffect(() => { loadConvs(); }, [loadConvs]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 650);
    return () => clearInterval(t);
  }, [loading]);

  function newChat() {
    setConvId(null); setMessages([]); setError(null); setDrawer(false);
  }

  async function openConv(id: string) {
    setDrawer(false);
    const r = await fetch(`/api/conversations/${id}`);
    if (!r.ok) return;
    const data = await r.json();
    setConvId(id);
    setMessages(
      (data.messages as { role: "user" | "assistant"; content: string; citations: Citation[]; events: SecurityEvents | null }[]).map((m) => ({
        id: ++idRef.current, role: m.role, content: m.content, citations: m.citations, events: m.events,
      })),
    );
  }

  async function removeConv(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setConvs((c) => c.filter((x) => x.id !== id));
    if (convId === id) newChat();
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
  }

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setError(null); setInput("");
    setMessages((m) => [...m, { id: ++idRef.current, role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, securityOn, conversationId: convId ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); }
      else {
        const r = data as ChatResult & { conversationId: string };
        if (!convId) { setConvId(r.conversationId); loadConvs(); }
        setMessages((m) => [...m, { id: ++idRef.current, role: "assistant", content: r.answer, citations: r.citations, events: r.events, typing: true }]);
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 lg:h-[calc(100vh-5rem)]">
      {/* History sidebar */}
      <ConversationList
        convs={convs} convId={convId} drawer={drawer}
        onNew={newChat} onOpen={openConv} onDelete={removeConv} onCloseDrawer={() => setDrawer(false)}
      />

      {/* Chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 md:hidden" aria-label="Chats">
              <PanelLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">Knowledge Assistant</h1>
              <p className="text-xs text-ink-500 sm:text-sm">
                Viewing as <span className="font-semibold text-ink-700">{ROLE_LABEL[role]}</span> · answers from Acme&apos;s documents
              </p>
            </div>
          </div>
          <SecurityToggle on={securityOn} onChange={setSecurityOn} />
        </div>

        <div className="scroll-slim flex-1 overflow-y-auto rounded-2xl border border-ink-100 bg-white p-4 sm:p-6">
          {messages.length === 0 && !loading ? (
            <Empty securityOn={securityOn} onPick={send} />
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((m) =>
                  m.role === "user" ? (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-sm text-white">{m.content}</div>
                    </motion.div>
                  ) : (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Sparkles className="h-4 w-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-ink-50 px-4 py-2.5 text-sm text-ink-800">
                          {m.typing ? <Typewriter text={m.content} /> : m.content}
                        </div>
                        {m.citations && <Sources citations={m.citations} />}
                        {m.events && <Events events={m.events} />}
                      </div>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
              {loading && <Pipeline step={step} securityOn={securityOn} />}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {error && <p className="mt-2 rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}

        <div className="mt-3 flex gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about company docs…" className="input"
          />
          <button type="button" onClick={() => send()} disabled={loading} className="btn-primary shrink-0">
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationList({
  convs, convId, drawer, onNew, onOpen, onDelete, onCloseDrawer,
}: {
  convs: Conversation[]; convId: string | null; drawer: boolean;
  onNew: () => void; onOpen: (id: string) => void; onDelete: (id: string, e: React.MouseEvent) => void; onCloseDrawer: () => void;
}) {
  const Inner = (
    <div className="flex h-full w-56 shrink-0 flex-col rounded-2xl border border-ink-100 bg-white p-3">
      <button type="button" onClick={onNew} className="btn-primary w-full text-sm"><Plus className="h-4 w-4" /> New chat</button>
      <div className="scroll-slim mt-3 flex-1 space-y-1 overflow-y-auto">
        {convs.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-ink-400">No conversations yet.</p>
        ) : convs.map((c) => (
          <button
            key={c.id} type="button" onClick={() => onOpen(c.id)}
            className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${c.id === convId ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-50"}`}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-ink-400" />
            <span className="min-w-0 flex-1 truncate">{c.title}</span>
            <span onClick={(e) => onDelete(c.id, e)} className="shrink-0 rounded p-0.5 text-ink-300 opacity-0 transition hover:text-coral-600 group-hover:opacity-100" role="button" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <div className="hidden md:block">{Inner}</div>
      {drawer && (
        <div className="fixed inset-0 z-40 bg-ink-900/40 md:hidden" onClick={onCloseDrawer}>
          <div className="absolute left-0 top-0 h-full p-3" onClick={(e) => e.stopPropagation()}>{Inner}</div>
        </div>
      )}
    </>
  );
}

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const step = Math.max(1, Math.round(text.length / 120));
    const t = setInterval(() => {
      setN((v) => {
        if (v >= text.length) { clearInterval(t); return v; }
        return Math.min(text.length, v + step);
      });
    }, 16);
    return () => clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}{n < text.length && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-brand-400 align-middle" />}</>;
}

function Pipeline({ step, securityOn }: { step: number; securityOn: boolean }) {
  const steps = securityOn ? STEPS : ["Searching documents", "Generating answer"];
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Sparkles className="h-4 w-4" /></div>
      <div className="space-y-1.5 rounded-2xl rounded-tl-sm bg-ink-50 px-4 py-3">
        {steps.map((s, i) => {
          const active = i === Math.min(step, steps.length - 1);
          const done = i < Math.min(step, steps.length - 1);
          return (
            <div key={s} className={`flex items-center gap-2 text-xs ${done ? "text-emerald-600" : active ? "text-brand-700" : "text-ink-400"}`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-3.5 w-3.5 rounded-full border border-ink-300" />}
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecurityToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button" onClick={() => onChange(!on)}
      className={`inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${on ? "border-brand-200 bg-brand-50 text-brand-700" : "border-coral-200 bg-coral-50 text-coral-700"}`}
    >
      {on ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
      SecureRAG {on ? "ON" : "OFF"}
      <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-brand-600" : "bg-coral-500"}`}>
        <motion.span layout className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow" style={{ left: on ? "1.125rem" : "0.125rem" }} />
      </span>
    </button>
  );
}

function Sources({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((c, i) => (
        <span key={`${c.docId}-${c.idx}`} title={c.snippet} className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2 py-0.5 text-xs text-ink-600">
          <FileText className="h-3 w-3 text-brand-500" /> [{i + 1}] {c.docTitle}
        </span>
      ))}
    </div>
  );
}

function Events({ events }: { events: SecurityEvents }) {
  if (!events.securityOn) {
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-700">
        <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span><b>SecureRAG is OFF.</b> No access control, injection defense, or PII redaction was applied — this is what an unsecured RAG app exposes.</span>
      </div>
    );
  }
  const rows: { icon: typeof Ban; tone: string; text: string }[] = [];
  if (events.inputBlocked) rows.push({ icon: Ban, tone: "coral", text: "Input blocked — prompt-injection / jailbreak attempt stopped." });
  if (events.accessFilteredDocs.length) rows.push({ icon: EyeOff, tone: "amber", text: `Access control hid ${events.accessFilteredDocs.length} document(s) you're not cleared for: ${events.accessFilteredDocs.join(", ")}.` });
  if (events.quarantinedChunks.length) rows.push({ icon: Bug, tone: "coral", text: `Neutralized a hidden injection in: ${events.quarantinedChunks.map((q) => q.docTitle).join(", ")}.` });
  if (events.redactions.length) rows.push({ icon: Lock, tone: "brand", text: `Redacted sensitive data: ${events.redactions.map((r) => `${r.type}×${r.count}`).join(", ")}.` });
  if (!events.inputBlocked && events.grounded) rows.push({ icon: CheckCircle2, tone: "emerald", text: "Answer grounded in retrieved sources." });
  const toneMap: Record<string, string> = { coral: "bg-coral-50 text-coral-700", amber: "bg-amber-50 text-amber-700", brand: "bg-brand-50 text-brand-700", emerald: "bg-emerald-50 text-emerald-700" };
  return (
    <div className="mt-2 space-y-1">
      {rows.map((r, i) => {
        const Icon = r.icon;
        return <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${toneMap[r.tone]}`}><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{r.text}</span></div>;
      })}
    </div>
  );
}

function Empty({ securityOn, onPick }: { securityOn: boolean; onPick: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 rounded-2xl bg-brand-50 p-4"><Sparkles className="h-8 w-8 text-brand-600" /></div>
      <h2 className="font-display text-lg font-semibold text-ink-900">Ask Acme&apos;s knowledge base</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        Try the demo: toggle <b>SecureRAG {securityOn ? "OFF" : "ON"}</b> and watch what changes. As an Employee, ask for the CEO&apos;s salary — then log in as HR or Admin to see access change.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((q) => (
          <button key={q} type="button" onClick={() => onPick(q)} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-brand-300 hover:text-brand-700">{q}</button>
        ))}
      </div>
    </div>
  );
}
