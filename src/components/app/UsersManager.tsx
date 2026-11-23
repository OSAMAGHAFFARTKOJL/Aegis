"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, Check } from "lucide-react";
import { ROLE_LABEL, ROLES, type Role } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export function UsersManager({ meId }: { meId: string }) {
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(id: string, role: Role) {
    setSavingId(id);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, role }),
    });
    const data = await res.json();
    setSavingId(null);
    if (!res.ok) {
      setError(data.error ?? "Could not update role.");
      // revert
      setUsers((us) => [...us]);
      return;
    }
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, role } : u)));
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
          <Users className="h-6 w-6 text-brand-600" /> Users
        </h1>
        <p className="mt-1 text-ink-600">
          Assign roles. A user&apos;s role decides which documents they can access — only admins can
          change it.
        </p>
      </div>

      {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}

      {loading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {users.map((u) => {
            const isMe = u.id === meId;
            return (
              <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                  {(u.name || u.email).split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">
                    {u.name} {isMe && <span className="text-xs text-ink-400">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-ink-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {savingId === u.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  ) : savedId === u.id ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : null}
                  <div className="flex rounded-lg border border-ink-200 p-0.5">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        disabled={isMe && r !== "admin"}
                        onClick={() => changeRole(u.id, r)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          u.role === r ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"
                        }`}
                      >
                        {ROLE_LABEL[r]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-ink-400">
        Tip for the demo: you can also just log in as <span className="font-mono">hr@aegis.dev</span> or{" "}
        <span className="font-mono">admin@aegis.dev</span> to experience each role directly.
      </p>
    </div>
  );
}
