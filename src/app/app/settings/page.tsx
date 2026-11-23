import { ShieldCheck, Lock, KeyRound, Server, BadgeCheck } from "lucide-react";
import { currentUser } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/types";
import { ProfileForm } from "@/components/app/ProfileForm";

export default async function SettingsPage() {
  const sessionUser = await currentUser();
  if (!sessionUser) return null;
  const user = await getUserById(sessionUser.id);

  const security = [
    { icon: Lock, title: "Password hashing", body: "Passwords are hashed with bcrypt — never stored in plain text." },
    { icon: KeyRound, title: "Session security", body: "Signed JWTs in httpOnly cookies; OAuth via Google & GitHub." },
    { icon: ShieldCheck, title: "Role-based access", body: "Documents are visible only to permitted roles, enforced at retrieval." },
    { icon: Server, title: "Abuse protection", body: "Rate-limited endpoints, Zod validation, and an audit log of every query." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-ink-600">Your account and how Aegis keeps it secure.</p>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Profile</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            <BadgeCheck className="h-3.5 w-3.5" /> {ROLE_LABEL[sessionUser.role]}
          </span>
        </div>
        <ProfileForm
          initialName={user?.name ?? ""}
          email={user?.email ?? ""}
          hasPassword={Boolean(user?.passwordHash)}
        />
        <p className="mt-4 text-sm text-ink-500">
          Your role is <b>assigned by an admin</b> and determines which documents you can access.
          {sessionUser.role === "admin" ? " As an admin, manage everyone's roles on the Users page." : ""}
        </p>
      </div>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900"><ShieldCheck className="h-4 w-4 text-brand-600" /> Security</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {security.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-3 rounded-xl border border-ink-100 p-4">
                <div className="rounded-lg bg-ink-50 p-2.5 text-ink-600"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium text-ink-900">{s.title}</p>
                  <p className="mt-0.5 text-sm text-ink-600">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
