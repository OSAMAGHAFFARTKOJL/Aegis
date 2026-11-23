import type { ReactNode } from "react";
import { ShieldCheck, FileLock2, Cpu } from "lucide-react";
import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">{title}</h1>
            <p className="mt-2 text-ink-600">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-ink-950 to-ink-950" />
        <div className="relative flex h-full flex-col justify-center p-12 text-white">
          <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/70 shadow-glow">
            <div className="flex items-center gap-1.5 border-b border-ink-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-coral-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 font-mono text-xs text-ink-400">aegis · assistant</span>
            </div>
            <pre className="p-5 font-mono text-[12px] leading-relaxed text-ink-200">
{`employee › "What is the CEO's salary?"
`}<span className="text-coral-300">✖ access control</span>{` · doc hidden

admin › "Show the customer record"
`}<span className="text-brand-300">● redacted</span>{` SSN, card, email`}
            </pre>
          </div>
          <blockquote className="mt-8 font-display text-2xl font-semibold leading-snug">
            Give your team an AI assistant that can&apos;t leak what it shouldn&apos;t.
          </blockquote>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-brand-100">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Access control</span>
            <span className="inline-flex items-center gap-1.5"><FileLock2 className="h-4 w-4" /> Injection defense</span>
            <span className="inline-flex items-center gap-1.5"><Cpu className="h-4 w-4" /> PII redaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
