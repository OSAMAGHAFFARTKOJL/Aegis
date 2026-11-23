"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { OAuthButtons } from "./OAuthButtons";

function Inner({ providers }: { providers: { google: boolean; github: boolean } }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Incorrect email or password.");
    else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
        </div>
        {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in…</> : <>Log in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <OAuthButtons google={providers.google} github={providers.github} />

      <div className="mt-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-3 text-xs text-ink-600">
        <p className="font-semibold text-ink-700">Demo accounts (password: demo1234)</p>
        <div className="mt-1 grid gap-1">
          <DemoRow set={(e, p) => { setEmail(e); setPassword(p); }} email="demo@aegis.dev" label="Employee" />
          <DemoRow set={(e, p) => { setEmail(e); setPassword(p); }} email="hr@aegis.dev" label="HR" />
          <DemoRow set={(e, p) => { setEmail(e); setPassword(p); }} email="admin@aegis.dev" label="Admin" />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-600">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-700">Create an account</Link>
      </p>
    </>
  );
}

function DemoRow({ email, label, set }: { email: string; label: string; set: (e: string, p: string) => void }) {
  return (
    <button type="button" onClick={() => set(email, "demo1234")} className="flex items-center justify-between rounded-lg px-2 py-1 text-left hover:bg-white">
      <span className="font-mono">{email}</span>
      <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-700">{label}</span>
    </button>
  );
}

export function LoginForm({ providers }: { providers: { google: boolean; github: boolean } }) {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <Inner providers={providers} />
    </Suspense>
  );
}
