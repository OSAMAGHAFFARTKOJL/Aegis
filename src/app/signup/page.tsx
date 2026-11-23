import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { oauthProviders } from "@/lib/auth";
import { currentUser } from "@/lib/session";

export default async function SignupPage() {
  if (await currentUser()) redirect("/app");
  return (
    <AuthShell title="Create your account" subtitle="Spin up a secure knowledge assistant in minutes.">
      <SignupForm providers={oauthProviders} />
    </AuthShell>
  );
}
