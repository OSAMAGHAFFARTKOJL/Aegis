"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { OAuthButtons } from "./OAuthButtons";

export function SignupForm({ providers }: { providers: { google: boolean; github: boolean } }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create account.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) router.push("/login");
    else {
      router.push("/app");
      router.refresh();
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input id="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Alex Rivera" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 8 characters" />
          <p className="mt-1.5 text-xs text-ink-400">Hashed with bcrypt — never stored in plain text.</p>
        </div>
        {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <OAuthButtons google={providers.google} github={providers.github} />

      <ul className="mt-5 space-y-2">
        {["Role-based secure assistant", "Your docs, answered with citations", "No credit card required"].map((t) => (
          <li key={t} className="flex items-center gap-2 text-sm text-ink-600">
            <Check className="h-4 w-4 text-brand-600" /> {t}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700">Log in</Link>
      </p>
    </>
  );
}
