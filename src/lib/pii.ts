// PII / secret detection and redaction for model output.

export interface Redaction {
  type: string;
  count: number;
}

interface Pattern {
  type: string;
  re: RegExp;
  mask: (m: string) => string;
}

const PATTERNS: Pattern[] = [
  {
    type: "SSN",
    re: /\b\d{3}-\d{2}-\d{4}\b/g,
    mask: () => "[REDACTED-SSN]",
  },
  {
    type: "Credit card",
    re: /\b(?:\d[ -]?){13,16}\b/g,
    mask: () => "[REDACTED-CARD]",
  },
  {
    type: "API key / secret",
    re: /\b(?:sk|psk|key|token)[-_][A-Za-z0-9-]{6,}\b/gi,
    mask: () => "[REDACTED-SECRET]",
  },
  {
    type: "Email",
    re: /\b([\w.+-])[\w.+-]*@([\w-]+\.[\w.-]+)\b/g,
    mask: (m) => {
      const [local, domain] = m.split("@");
      return `${local[0]}•••@${domain}`;
    },
  },
  {
    type: "Phone",
    re: /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g,
    mask: () => "[REDACTED-PHONE]",
  },
];

export function redact(text: string): { text: string; redactions: Redaction[] } {
  let out = text;
  const redactions: Redaction[] = [];
  for (const p of PATTERNS) {
    let count = 0;
    out = out.replace(p.re, (m) => {
      count++;
      return p.mask(m);
    });
    if (count > 0) redactions.push({ type: p.type, count });
  }
  return { text: out, redactions };
}

export function containsPII(text: string): boolean {
  return PATTERNS.some((p) => {
    p.re.lastIndex = 0;
    return p.re.test(text);
  });
}
