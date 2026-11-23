// Shared domain types for Aegis — secure AI knowledge assistant.

export type Role = "employee" | "hr" | "admin";

export const ROLES: Role[] = ["employee", "hr", "admin"];

export const ROLE_LABEL: Record<Role, string> = {
  employee: "Employee",
  hr: "HR",
  admin: "Admin",
};

// ---- Guard engine (reused for the security layer) -------------------------

export type Verdict = "block" | "review" | "allow";

export interface Signal {
  name: string;
  evidence: string;
}

export interface GuardScore {
  model: string;
  attackProbability: number;
}

export interface GuardResult {
  threatScore: number;
  verdict: Verdict;
  attackTypes: string[];
  summary: string;
  signals: Signal[];
  recommendation: string;
  guard: GuardScore | null;
  reasoner: "groq" | "built-in";
}

// ---- Accounts -------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  role: Role;
  image: string | null;
  createdAt: string;
}

// ---- Knowledge base -------------------------------------------------------

export type ThreatStatus = "clean" | "injection";

export interface Document {
  id: string;
  title: string;
  source: string; // e.g. "seed", "upload:pdf"
  ownerId: string | null;
  allowedRoles: Role[];
  // Computed automatically at ingestion — not set by a human.
  threat: ThreatStatus;
  threatSignals: { idx: number; reason: string }[];
  createdAt: string;
  chunkCount?: number;
}

export interface Chunk {
  id: string;
  docId: string;
  idx: number;
  content: string;
}

// ---- Chat / RAG -----------------------------------------------------------

export interface Citation {
  docId: string;
  docTitle: string;
  idx: number;
  snippet: string;
}

export interface SecurityEvents {
  securityOn: boolean;
  inputBlocked: boolean;
  inputGuard?: GuardResult | null;
  accessFilteredDocs: string[]; // titles of docs hidden by permission
  quarantinedChunks: { docTitle: string; reason: string }[];
  redactions: { type: string; count: number }[];
  grounded: boolean;
}

export interface ChatResult {
  answer: string;
  citations: Citation[];
  events: SecurityEvents;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  events: SecurityEvents | null;
  securityOn: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  role: Role;
  query: string;
  securityOn: boolean;
  verdict: Verdict | "n/a";
  events: Omit<SecurityEvents, "inputGuard">;
  createdAt: string;
}
