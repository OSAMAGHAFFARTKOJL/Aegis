"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, User, Lock } from "lucide-react";

export function ProfileForm({
  initialName,
  email,
  hasPassword,
}: {
  initialName: string;
  email: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    const payload: Record<string, string> = {};
    if (name.trim() && name.trim() !== initialName) payload.name = name.trim();
    if (newPassword) { payload.newPassword = newPassword; payload.currentPassword = currentPassword; }
    if (Object.keys(payload).length === 0) { setSaving(false); return; }
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Could not save."); return; }
    setSaved(true); setCurrentPassword(""); setNewPassword("");
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label"><User className="mr-1 inline h-3.5 w-3.5" /> Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" minLength={2} />
        </div>
        <div>
          <label className="label">Email</label>
          <input value={email} disabled className="input opacity-60" />
        </div>
      </div>

      {hasPassword ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label"><Lock className="mr-1 inline h-3.5 w-3.5" /> Current password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" placeholder="To change password" autoComplete="current-password" />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="At least 8 characters" autoComplete="new-password" />
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-500">You sign in with Google/GitHub, so there&apos;s no password to change here.</p>
      )}

      {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : saved ? <><Check className="h-4 w-4" /> Saved</> : "Save changes"}
      </button>
    </form>
  );
}
