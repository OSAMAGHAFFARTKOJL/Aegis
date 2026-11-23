import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-900 text-ink-100">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
              <LogoMark />
              <span>Aegis</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-300">
              The secure AI knowledge assistant. Chat with your company&apos;s docs —
              without leaking what you shouldn&apos;t.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { href: "#demo", label: "The difference" },
              { href: "#security", label: "Security" },
              { href: "#how", label: "How it works" },
              { href: "#pricing", label: "Pricing" },
            ]}
          />
          <FooterCol
            title="Security"
            links={[
              { href: "#security", label: "Access control" },
              { href: "#security", label: "Injection defense" },
              { href: "#security", label: "PII redaction" },
              { href: "#security", label: "Audit log" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { href: "/login", label: "Log in" },
              { href: "/signup", label: "Create account" },
              { href: "/dashboard", label: "Dashboard" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink-800 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aegis. Built for teams that handle sensitive docs.</p>
          <p>Aligned with the OWASP Top 10 for LLM Applications.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-ink-300 transition hover:text-brand-400"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
