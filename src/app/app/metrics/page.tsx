"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Loader2, Ban, EyeOff, Bug, Lock, Activity, ShieldCheck,
} from "lucide-react";

interface Metrics {
  totals: { queries: number; secureQueries: number; insecureQueries: number; blocked: number; accessDenied: number; injections: number; redactions: number };
  redactionTypes: Record<string, number>;
  series: { date: string; blocked: number; accessDenied: number; injections: number; redactions: number }[];
  scope: "all" | "you";
}

const SEG = [
  { key: "blocked", label: "Injections/jailbreaks blocked", color: "#df2020", icon: Ban },
  { key: "accessDenied", label: "Access denials", color: "#e8820a", icon: EyeOff },
  { key: "injections", label: "Doc injections quarantined", color: "#6d5efc", icon: Bug },
  { key: "redactions", label: "PII redactions", color: "#0ea5a0", icon: Lock },
] as const;

export default function MetricsPage() {
  const [m, setM] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics").then((r) => r.json()).then(setM).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>;
  if (!m) return null;

  const maxDay = Math.max(1, ...m.series.map((d) => d.blocked + d.accessDenied + d.injections + d.redactions));
  const threatsStopped = m.totals.blocked + m.totals.accessDenied + m.totals.injections + m.totals.redactions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
          <BarChart3 className="h-6 w-6 text-brand-600" /> Security metrics
        </h1>
        <p className="mt-1 text-ink-600">
          What SecureRAG has caught{m.scope === "all" ? " across the workspace (admin view)" : " on your queries"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile icon={Activity} tone="brand" value={m.totals.queries} label="Total queries" />
        <Tile icon={ShieldCheck} tone="emerald" value={threatsStopped} label="Threats stopped" />
        <Tile icon={Ban} tone="coral" value={m.totals.blocked + m.totals.injections} label="Injections blocked" />
        <Tile icon={Lock} tone="brand" value={m.totals.redactions} label="PII values redacted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* 7-day chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900">Last 7 days</h2>
          <div className="mt-6 flex items-end justify-between gap-2" style={{ height: 180 }}>
            {m.series.map((d) => {
              const total = d.blocked + d.accessDenied + d.injections + d.redactions;
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full max-w-[36px] flex-1 flex-col-reverse overflow-hidden rounded-md bg-ink-50" style={{ height: 150 }}>
                    {SEG.map((s) => {
                      const v = d[s.key];
                      if (!v) return null;
                      return <div key={s.key} title={`${s.label}: ${v}`} style={{ height: `${(v / maxDay) * 100}%`, background: s.color }} />;
                    })}
                  </div>
                  <span className="text-[10px] tabular-nums text-ink-400">{d.date.slice(5)}</span>
                  <span className="text-[10px] font-semibold text-ink-500">{total || ""}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {SEG.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} /> {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-ink-900">Event breakdown</h2>
            <div className="mt-4 space-y-3">
              {SEG.map((s) => {
                const Icon = s.icon;
                const val = s.key === "blocked" ? m.totals.blocked : s.key === "accessDenied" ? m.totals.accessDenied : s.key === "injections" ? m.totals.injections : m.totals.redactions;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}1a`, color: s.color }}><Icon className="h-4 w-4" /></span>
                    <span className="flex-1 text-sm text-ink-700">{s.label}</span>
                    <span className="font-display text-lg font-bold tabular-nums text-ink-900">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-ink-900">PII redacted by type</h2>
            {Object.keys(m.redactionTypes).length === 0 ? (
              <p className="mt-3 text-sm text-ink-400">None yet. Ask (with SecureRAG on) for a record containing an SSN or card to see redaction.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {Object.entries(m.redactionTypes).map(([type, n]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-sm text-ink-600">{type}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (n / Math.max(...Object.values(m.redactionTypes))) * 100)}%` }} />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold tabular-nums text-ink-700">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, tone, value, label }: { icon: typeof Activity; tone: "brand" | "emerald" | "coral"; value: number; label: string }) {
  const map = { brand: "bg-brand-50 text-brand-600", emerald: "bg-emerald-50 text-emerald-600", coral: "bg-coral-50 text-coral-600" };
  return (
    <div className="card p-5">
      <div className={`inline-flex rounded-xl p-2.5 ${map[tone]}`}><Icon className="h-5 w-5" /></div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums text-ink-900">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}
