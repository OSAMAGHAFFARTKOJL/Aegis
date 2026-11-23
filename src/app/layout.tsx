import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aegis — the secure AI knowledge assistant",
  description:
    "Aegis is a 'chat with your company docs' assistant with security built in: role-based access control, prompt-injection defense, and PII redaction — so your AI can't leak what it shouldn't.",
  keywords: [
    "secure RAG",
    "AI knowledge assistant",
    "prompt injection defense",
    "role-based access control",
    "PII redaction",
    "enterprise AI security",
  ],
  openGraph: {
    title: "Aegis — the secure AI knowledge assistant",
    description: "A company AI assistant that can't leak what it shouldn't.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
