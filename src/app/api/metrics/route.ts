import { NextResponse } from "next/server";
import { listAudit } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { canViewAllAudit } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const entries = await listAudit(
    canViewAllAudit(user.role) ? { limit: 2000 } : { userId: user.id, limit: 2000 },
  );

  const totals = {
    queries: entries.length,
    secureQueries: 0,
    insecureQueries: 0,
    blocked: 0,
    accessDenied: 0,
    injections: 0,
    redactions: 0,
  };
  const redactionTypes: Record<string, number> = {};
  const dayMap = new Map<string, { blocked: number; accessDenied: number; injections: number; redactions: number }>();

  for (const e of entries) {
    if (e.securityOn) totals.secureQueries++; else totals.insecureQueries++;
    const ev = e.events;
    const blocked = ev.inputBlocked ? 1 : 0;
    const accessDenied = ev.accessFilteredDocs?.length ? 1 : 0;
    const injections = ev.quarantinedChunks?.length ?? 0;
    const redactions = (ev.redactions ?? []).reduce((a, r) => a + r.count, 0);
    totals.blocked += blocked;
    totals.accessDenied += accessDenied;
    totals.injections += injections;
    totals.redactions += redactions;
    for (const r of ev.redactions ?? []) redactionTypes[r.type] = (redactionTypes[r.type] ?? 0) + r.count;

    const day = e.createdAt.slice(0, 10);
    const d = dayMap.get(day) ?? { blocked: 0, accessDenied: 0, injections: 0, redactions: 0 };
    d.blocked += blocked; d.accessDenied += accessDenied; d.injections += injections; d.redactions += redactions;
    dayMap.set(day, d);
  }

  // Last 7 days series
  const series: { date: string; blocked: number; accessDenied: number; injections: number; redactions: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const v = dayMap.get(key) ?? { blocked: 0, accessDenied: 0, injections: 0, redactions: 0 };
    series.push({ date: key, ...v });
  }

  return NextResponse.json({ totals, redactionTypes, series, scope: canViewAllAudit(user.role) ? "all" : "you" });
}
