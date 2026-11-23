// ---------------------------------------------------------------------------
// PromptShield guard engine.
//   1. Specialized model — Meta Prompt Guard 2 (attack probability) via Groq.
//   2. Rule engine       — transparent patterns for injection / jailbreak /
//                          extraction / exfiltration / PII, always on.
//   3. Reasoning         — gpt-oss writes the explanation (optional).
// ---------------------------------------------------------------------------

import type { GuardResult, Signal, Verdict } from "./types";
import {
  promptGuardScore,
  guardReason,
  GUARD_MODEL_NAME,
} from "./groq";

interface RuleSignal {
  attackType: string;
  name: string;
  weight: number;
  severe?: boolean;
  patterns: RegExp[];
}

const RULES: RuleSignal[] = [
  {
    attackType: "Prompt injection",
    name: "Instruction override",
    weight: 34,
    severe: true,
    patterns: [
      /ignore\s+(all\s+|the\s+|any\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|messages?|rules?)/i,
      /disregard\s+(the\s+|all\s+|any\s+)?(previous|above|prior)/i,
      /forget\s+(your|all|everything|the)\s+(instructions?|rules?|previous)/i,
      /new\s+instructions?\s*:/i,
      /override\s+(your|the|all)\s+(instructions?|rules?|settings?)/i,
    ],
  },
  {
    attackType: "Jailbreak",
    name: "Jailbreak / persona bypass",
    weight: 32,
    severe: true,
    patterns: [
      /\bDAN\b|do anything now/i,
      /developer mode/i,
      /\bjailbreak/i,
      /pretend\s+(you\s+are|to\s+be)|act\s+as\s+(if|though)/i,
      /you\s+are\s+no\s+longer|you\s+have\s+no\s+(rules|restrictions|filters?)/i,
      /without\s+any\s+(restrictions?|rules?|filters?|limitations?)|unfiltered|unrestricted/i,
      /stay\s+in\s+character/i,
    ],
  },
  {
    attackType: "System-prompt extraction",
    name: "Instruction / prompt extraction",
    weight: 30,
    severe: true,
    patterns: [
      /(reveal|show|print|repeat|output|display|tell me)\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?|guidelines?)/i,
      /what\s+(are|were)\s+your\s+(instructions?|rules?|guidelines?|system prompt)/i,
      /(repeat|output|print|dump|list)\s+(the\s+|all\s+|everything\s+)?(text|words|everything|content)?\s*(that\s+)?(appears?\s+)?(written\s+)?(before|above)/i,
      /initial\s+prompt|original\s+instructions?/i,
    ],
  },
  {
    attackType: "Secret extraction",
    name: "Sensitive-data extraction",
    weight: 30,
    severe: true,
    patterns: [
      // verb + sensitive target (within a short window)
      /(reveal|show|print|list|share|state|give|provide|repeat|output|dump|tell)\b[\s\S]{0,60}\b(override\s*code|admin\s*code|secret|password|api\s*key|access\s*token|credentials?|internal\s+notes?|reference\s+notes?|configuration|any\s+codes?)\b/i,
      /\b(override\s*code|admin\s*code)\b/i,
    ],
  },
  {
    attackType: "Data exfiltration",
    name: "Secret / credential request",
    weight: 30,
    severe: true,
    patterns: [
      /\b(api[\s_-]?key|secret\s*key|access\s*token|password|credential|private\s*key)s?\b/i,
      /environment\s+variables?|process\.env|\.env\b/i,
      /(send|post|upload|exfiltrate|leak)\s+(it|them|the data|everything)?\s*(to\s+)?(https?:\/\/|www\.)/i,
    ],
  },
  {
    attackType: "Obfuscation",
    name: "Encoded / obfuscated payload",
    weight: 16,
    patterns: [
      /[A-Za-z0-9+/]{48,}={0,2}/, // long base64 blob
      /(\\u[0-9a-fA-F]{4}){4,}/, // unicode escape run
      /\bbase64\b|\brot13\b|decode this/i,
    ],
  },
  {
    attackType: "Indirect injection",
    name: "Embedded system directive",
    weight: 22,
    patterns: [
      /<\s*system\s*>|\[\s*system\s*\]|###\s*system/i,
      /<\|im_start\|>|<\|system\|>/i,
      /when\s+you\s+(read|see|process)\s+this[, ]+(ignore|do|execute|send)/i,
    ],
  },
  {
    attackType: "Tool/agent abuse",
    name: "Dangerous action request",
    weight: 18,
    patterns: [
      /\brm\s+-rf\b|drop\s+table|delete\s+(all|the)\s+(users?|records?|database)/i,
      /transfer\s+\$?\d|wire\s+(the\s+)?(money|funds)/i,
      /disable\s+(the\s+)?(safety|guardrails?|security|filter)/i,
    ],
  },
];

const PII = {
  attackType: "PII exposure",
  name: "Personal data present",
  patterns: [
    /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, // email
    /\b(?:\d[ -]?){13,16}\b/, // card-like
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  ],
};

function verdictFromScore(score: number): Verdict {
  if (score >= 70) return "block";
  if (score >= 40) return "review";
  return "allow";
}

function clamp(v: number): number {
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, Math.round(v)));
}

interface RuleOutput {
  ruleScore: number;
  signals: Signal[];
  attackTypes: string[];
  severe: boolean;
}

function runRules(input: string): RuleOutput {
  const signals: Signal[] = [];
  const types = new Set<string>();
  let score = 0;
  let severe = false;

  for (const rule of RULES) {
    const hit = rule.patterns.find((re) => re.test(input));
    if (hit) {
      const m = input.match(hit);
      signals.push({
        name: rule.name,
        evidence: m ? `“…${m[0].slice(0, 60)}…”` : "pattern matched",
      });
      types.add(rule.attackType);
      score += rule.weight;
      if (rule.severe) severe = true;
    }
  }
  const piiHit = PII.patterns.find((re) => re.test(input));
  if (piiHit) {
    const m = input.match(piiHit);
    signals.push({
      name: PII.name,
      evidence: m ? `“…${m[0].slice(0, 40)}…”` : "PII detected",
    });
    types.add(PII.attackType);
    score += 14;
  }

  return {
    ruleScore: clamp(score > 0 ? 18 + score * 0.95 : 4),
    signals,
    attackTypes: [...types],
    severe,
  };
}

function builtInSummary(verdict: Verdict, types: string[]): string {
  if (verdict === "allow") {
    return "No attack patterns detected — this input looks safe to pass to your model.";
  }
  const list = types.length ? types.join(", ").toLowerCase() : "suspicious manipulation";
  if (verdict === "block") {
    return `High risk: detected ${list}. PromptShield recommends blocking this before it reaches your model.`;
  }
  return `Potential ${list}. Flag for review or sanitize before passing to your model.`;
}

function builtInRecommendation(verdict: Verdict): string {
  if (verdict === "block") return "Block this input and do not forward it to the model.";
  if (verdict === "review") return "Sanitize or require review before forwarding to the model.";
  return "Allow — no action required.";
}

// Fast rules-only scan for retrieved document chunks (no network call).
export function scanChunkRules(text: string): {
  malicious: boolean;
  attackTypes: string[];
  signals: Signal[];
} {
  const rule = runRules(text);
  return {
    malicious: rule.severe || rule.ruleScore >= 50,
    attackTypes: rule.attackTypes,
    signals: rule.signals,
  };
}

// Lightweight input scan: rules + Prompt Guard model, no reasoning call.
export async function quickScan(text: string): Promise<{
  malicious: boolean;
  score: number;
  attackTypes: string[];
}> {
  const rule = runRules(text);
  const attackProb = await promptGuardScore(text);
  const guardRisk = attackProb != null ? Math.round(attackProb * 100) : null;
  let score = guardRisk != null ? 0.6 * guardRisk + 0.4 * rule.ruleScore : rule.ruleScore;
  if (rule.severe) score = Math.max(score, 68);
  if (guardRisk != null && guardRisk >= 85) score = Math.max(score, 80);
  score = clamp(score);
  const types = new Set(rule.attackTypes);
  if (types.size === 0 && guardRisk != null && guardRisk >= 60) {
    types.add("Prompt injection / jailbreak");
  }
  return { malicious: score >= 55, score, attackTypes: [...types] };
}

export async function guard(input: string): Promise<GuardResult> {
  const text = input.trim().slice(0, 8000);
  const rule = runRules(text);

  // Specialized model (Prompt Guard) — attack probability.
  const attackProb = await promptGuardScore(text);
  const guardRisk = attackProb != null ? Math.round(attackProb * 100) : null;

  // Combine.
  let threatScore =
    guardRisk != null ? 0.6 * guardRisk + 0.4 * rule.ruleScore : rule.ruleScore;
  if (rule.severe) threatScore = Math.max(threatScore, 68);
  if (guardRisk != null && guardRisk >= 85) threatScore = Math.max(threatScore, 80);
  threatScore = clamp(threatScore);
  const verdict = verdictFromScore(threatScore);

  // Attack types: combine rule types with model signal.
  const attackTypes = new Set(rule.attackTypes);
  if (attackTypes.size === 0 && guardRisk != null && guardRisk >= 60) {
    attackTypes.add("Prompt injection / jailbreak");
  }

  const guardScore =
    attackProb != null
      ? { model: GUARD_MODEL_NAME, attackProbability: attackProb }
      : null;

  // Reasoning layer.
  const reasoning = await guardReason(text, rule.signals, attackProb);
  if (reasoning) {
    const types = reasoning.attackTypes?.length
      ? reasoning.attackTypes
      : [...attackTypes];
    return {
      threatScore,
      verdict,
      attackTypes: types,
      summary: reasoning.summary ?? builtInSummary(verdict, types),
      signals:
        reasoning.signals && reasoning.signals.length
          ? reasoning.signals.slice(0, 8)
          : rule.signals,
      recommendation: reasoning.recommendation ?? builtInRecommendation(verdict),
      guard: guardScore,
      reasoner: "groq",
    };
  }

  const types = [...attackTypes];
  return {
    threatScore,
    verdict,
    attackTypes: types,
    summary: builtInSummary(verdict, types),
    signals: rule.signals,
    recommendation: builtInRecommendation(verdict),
    guard: guardScore,
    reasoner: "built-in",
  };
}
