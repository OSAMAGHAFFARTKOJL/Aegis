import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { UsersManager } from "@/components/app/UsersManager";

export default async function UsersPage() {
  const user = await currentUser();
  if (!user || user.role !== "admin") redirect("/app");
  return <UsersManager meId={user.id} />;
}
