import { ScrollText, ShieldCheck, ShieldOff } from "lucide-react";
import { currentUser } from "@/lib/session";
import { listAudit } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const user = await currentUser();
  if (!user) return null;
  const entries = await listAudit(user.role === "admin" ? { limit: 100 } : { userId: user.id, limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
          <ScrollText className="h-6 w-6 text-brand-600" /> Audit log
        </h1>
        <p className="mt-1 text-ink-600">
          Every query, its security mode, and what the protections did — for review and compliance.
          {user.role === "admin" ? " You're viewing all activity (admin)." : " You're viewing your own activity."}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          No activity yet. Ask the assistant something to populate the log.
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {entries.map((e) => {
            const tags: string[] = [];
            if (e.events.inputBlocked) tags.push("input blocked");
            if (e.events.accessFilteredDocs?.length) tags.push(`hid ${e.events.accessFilteredDocs.length} doc(s)`);
            if (e.events.quarantinedChunks?.length) tags.push("injection quarantined");
            if (e.events.redactions?.length) tags.push(`redacted ${e.events.redactions.reduce((a, r) => a + r.count, 0)}`);
            return (
              <div key={e.id} className="flex gap-4 p-4">
                <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${e.securityOn ? "bg-brand-50 text-brand-600" : "bg-coral-50 text-coral-600"}`}>
                  {e.securityOn ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink-800">{e.query}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                    <span className="rounded bg-ink-50 px-1.5 py-0.5">{ROLE_LABEL[e.role]}</span>
                    <span>SecureRAG {e.securityOn ? "ON" : "OFF"}</span>
                    {tags.map((t) => (
                      <span key={t} className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">{t}</span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-ink-400">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
