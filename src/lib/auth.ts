import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById, upsertOAuthUser } from "./db";
import { rateLimit } from "./rate-limit";
import type { Role } from "./types";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials?.password) return null;
      // Brute-force throttle: limit attempts per email and per client IP.
      const ip = (req?.headers?.["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || "unknown";
      const email = credentials.email.toLowerCase();
      if (!rateLimit(`login:${email}`, 8, 60_000).ok || !rateLimit(`login-ip:${ip}`, 20, 60_000).ok) {
        return null;
      }
      const user = await getUserByEmail(email);
      if (!user || !user.passwordHash) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

export const oauthProviders = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  github: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && account.provider !== "credentials" && token.email) {
        const u = await upsertOAuthUser({
          email: token.email,
          name: token.name ?? "",
          image: (token.picture as string | undefined) ?? null,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });
        token.id = u.id;
        token.role = u.role;
      } else if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: Role }).role ?? "employee";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        const fresh = await getUserById(token.id as string);
        session.user.id = token.id as string;
        session.user.role = (fresh?.role ?? (token.role as Role) ?? "employee");
        if (fresh?.name) session.user.name = fresh.name;
        if (fresh?.image) session.user.image = fresh.image;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
