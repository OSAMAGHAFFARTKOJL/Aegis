import Link from "next/link";
import {
  ShieldCheck,
  ShieldOff,
  ArrowRight,
  Check,
  Sparkles,
  Lock,
  EyeOff,
  Bug,
  CheckCircle2,
  Ban,
  FileLock2,
  Cpu,
  Database,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <BeforeAfter />
        <Security />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh">
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="animate-fade-up">
          <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Secure AI knowledge assistant</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 text-balance sm:text-5xl lg:text-6xl">
            An AI assistant that can&apos;t leak{" "}
            <span className="text-brand-600">what it shouldn&apos;t.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            Aegis lets your team chat with company documents — with security built into every step.
            Role-based access control, prompt-injection defense, and PII redaction keep your
            knowledge base from becoming a data breach.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary text-base">Start free <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="btn-outline text-base">See the live demo</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-brand-600" /> Access control</span>
            <span className="inline-flex items-center gap-1.5"><Bug className="h-4 w-4 text-brand-600" /> Injection defense</span>
            <span className="inline-flex items-center gap-1.5"><EyeOff className="h-4 w-4 text-brand-600" /> PII redaction</span>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 shadow-glow">
            <div className="flex items-center gap-1.5 border-b border-ink-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-coral-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 font-mono text-xs text-ink-400">aegis · employee</span>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="ml-auto w-max rounded-xl rounded-br-sm bg-brand-600 px-3 py-2 text-white">
                What is our CEO&apos;s salary?
              </div>
              <div className="rounded-xl rounded-tl-sm bg-ink-800 px-3 py-2 text-ink-100">
                I couldn&apos;t find that in documents you have access to.
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-brand-500/15 px-3 py-2 text-xs text-brand-200">
                <EyeOff className="h-3.5 w-3.5" /> Access control hid 1 document you&apos;re not cleared for.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: "LLM01", label: "Prompt injection — the top risk in the OWASP LLM Top 10" },
    { value: "5", label: "Security layers wrapped around retrieval" },
    { value: "3", label: "Roles with enforced document-level permissions" },
    { value: "1 toggle", label: "See the before/after breach, live" },
  ];
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-x grid grid-cols-2 gap-8 py-10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl font-bold text-brand-700 sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section id="demo" className="bg-ink-900 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> The difference
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
            Same question. One toggle. A breach, or not.
          </h2>
          <p className="mt-3 text-ink-300">
            Ask an unsecured RAG app for the CEO&apos;s salary and it hands it over. Aegis doesn&apos;t.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-coral-500/40 bg-ink-800/40 p-5">
            <div className="mb-3 flex items-center gap-2 text-coral-300">
              <ShieldOff className="h-5 w-5" /> <span className="font-semibold">Without Aegis</span>
            </div>
            <div className="ml-auto mb-2 w-max rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">What is our CEO&apos;s salary?</div>
            <div className="rounded-xl bg-ink-900 px-3 py-2 text-sm text-ink-100">CEO Dana Whitfield&apos;s base salary is <span className="text-coral-300">$1,200,000</span>.</div>
            <div className="mt-2 rounded-lg bg-coral-500/10 px-3 py-2 text-xs text-coral-200">Confidential HR data leaked to an employee.</div>
          </div>
          <div className="rounded-2xl border border-brand-400/40 bg-ink-800/40 p-5">
            <div className="mb-3 flex items-center gap-2 text-brand-300">
              <ShieldCheck className="h-5 w-5" /> <span className="font-semibold">With Aegis</span>
            </div>
            <div className="ml-auto mb-2 w-max rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">What is our CEO&apos;s salary?</div>
            <div className="rounded-xl bg-ink-900 px-3 py-2 text-sm text-ink-100">I couldn&apos;t find that in documents you have access to.</div>
            <div className="mt-2 rounded-lg bg-brand-500/15 px-3 py-2 text-xs text-brand-200">Access control hid the HR-only document.</div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-400">
          <Link href="/login" className="font-semibold text-brand-300 hover:underline">Log in to the demo</Link>{" "}
          and flip the SecureRAG toggle yourself — injection, access control and PII redaction all live.
        </p>
      </div>
    </section>
  );
}

function Security() {
  const layers = [
    { icon: Ban, title: "Input firewall", body: "Prompt-injection and jailbreak attempts are blocked by a trained guard model before retrieval." },
    { icon: EyeOff, title: "Access control", body: "Retrieval only searches documents your role is allowed to see — the model can't leak what it never receives." },
    { icon: Bug, title: "Injection defense", body: "Retrieved chunks are scanned for hidden instructions, so a poisoned document can't hijack the assistant." },
    { icon: Lock, title: "PII redaction", body: "SSNs, cards, emails and secrets are stripped from answers — a deterministic backstop the model can't bypass." },
    { icon: CheckCircle2, title: "Grounded answers", body: "Every answer cites its sources. No grounding, no answer — so it won't hallucinate your policy." },
    { icon: FileLock2, title: "Audit log", body: "Every query, verdict and redaction is logged for review and compliance." },
  ];
  return (
    <section id="security" className="py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">SecureRAG</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
            Security wrapped around every step of retrieval
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {layers.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.title} className="card p-6">
                <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{l.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{l.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Database, title: "Connect your docs", body: "Upload documents and tag each with the roles allowed to see it." },
    { icon: Cpu, title: "Secure retrieval", body: "Questions are screened, embedded with Google, and matched only against permitted, injection-free content." },
    { icon: ShieldCheck, title: "Safe answers", body: "A Groq LLM answers from citations; PII is redacted and everything is logged." },
  ];
  return (
    <section id="how" className="bg-ink-50/60 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
            Drop in your knowledge base. Keep the secrets in.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="card relative p-6">
                <span className="absolute right-5 top-5 font-display text-5xl font-bold text-ink-100">0{i + 1}</span>
                <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    { icon: Users, title: "Internal helpdesk", body: "HR, IT and policy answers — where finance can't read engineering's docs and nobody sees exec comp." },
    { icon: FileLock2, title: "Customer support", body: "Answer from a knowledge base full of customer data, with PII never exposed in a reply." },
    { icon: ShieldCheck, title: "Regulated teams", body: "Legal, healthcare and finance get grounded answers and an audit trail for every query." },
  ];
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Use cases</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
            Built for the docs you can&apos;t afford to leak
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="card p-6">
                <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{c.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Starter", price: "$0", period: "forever", tagline: "For small teams.", features: ["1 workspace", "Up to 50 documents", "Role-based access", "All security layers"], cta: "Start free", highlighted: false },
    { name: "Team", price: "$199", period: "/month", tagline: "For growing companies.", features: ["Unlimited documents", "SSO (Google, GitHub)", "Audit log export", "Priority support"], cta: "Start Team", highlighted: true },
    { name: "Enterprise", price: "Custom", period: "", tagline: "For regulated orgs.", features: ["Self-hosted / VPC", "Custom connectors", "SLAs & DPA", "Dedicated support"], cta: "Contact us", highlighted: false },
  ];
  return (
    <section id="pricing" className="bg-ink-50/60 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">Start free. Scale securely.</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`card relative flex flex-col p-7 ${p.highlighted ? "border-brand-500 ring-2 ring-brand-500/20" : ""}`}>
              {p.highlighted && <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
              <h3 className="font-display text-lg font-semibold text-ink-900">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-500">{p.tagline}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-ink-900">{p.price}</span>
                <span className="mb-1 text-sm text-ink-500">{p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-ink-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className={`mt-7 ${p.highlighted ? "btn-primary" : "btn-outline"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-14 text-center text-white sm:px-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Give your team a safe AI assistant today.
            </h2>
            <p className="mt-4 text-brand-100">Set up a secure knowledge base in minutes. Free to start.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-brand-50 text-base">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10 text-base">Try the demo</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
