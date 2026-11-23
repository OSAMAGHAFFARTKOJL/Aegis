"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  MessageSquare,
  FileLock2,
  ShieldCheck,
  ScrollText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  BadgeCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ROLE_LABEL, type Role } from "@/lib/types";

function navFor(role: Role) {
  const nav = [
    { href: "/app", label: "Assistant", icon: MessageSquare },
    { href: "/app/documents", label: "Documents", icon: FileLock2 },
    { href: "/app/security", label: "Security", icon: ShieldCheck },
    { href: "/app/metrics", label: "Metrics", icon: BarChart3 },
    { href: "/app/audit", label: "Audit log", icon: ScrollText },
  ];
  if (role === "admin") nav.push({ href: "/app/users", label: "Users", icon: Users });
  nav.push({ href: "/app/settings", label: "Settings", icon: Settings });
  return nav;
}

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: Role; image?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = navFor(user.role);

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              active ? "bg-brand-600 text-white shadow-soft" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-50/50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink-100 bg-white px-4 py-6 lg:flex">
        <Logo href="/app" />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <RoleBadge role={user.role} />
        <UserCard user={user} />
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 lg:hidden">
        <Logo href="/app" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-50"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-16 bottom-0 w-64 overflow-y-auto border-r border-ink-100 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <NavLinks />
            <div className="mt-4 space-y-3">
              <RoleBadge role={user.role} />
              <UserCard user={user} />
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-3 py-2">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
        <BadgeCheck className="h-4 w-4" /> {ROLE_LABEL[role]}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-brand-500">your role</span>
    </div>
  );
}

function UserCard({ user }: { user: { name?: string | null; email?: string | null } }) {
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{user.name || "Member"}</p>
          <p className="truncate text-xs text-ink-500">{user.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
