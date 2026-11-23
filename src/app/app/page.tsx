import { currentUser } from "@/lib/session";
import { Assistant } from "@/components/app/Assistant";

export default async function AssistantPage() {
  const user = await currentUser();
  return <Assistant role={user?.role ?? "employee"} />;
}
