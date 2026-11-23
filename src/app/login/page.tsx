import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { oauthProviders } from "@/lib/auth";
import { currentUser } from "@/lib/session";

export default async function LoginPage() {
  if (await currentUser()) redirect("/app");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your Aegis workspace.">
      <LoginForm providers={oauthProviders} />
    </AuthShell>
  );
}
