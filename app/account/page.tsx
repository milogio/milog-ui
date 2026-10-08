import { redirect } from "next/navigation";
import { AccountDashboard } from "@/components/AccountDashboard";
import { readSession } from "@/lib/milogServer";

export default async function AccountPage() {
  if (!await readSession()) redirect("/login?next=/account");
  return <AccountDashboard />;
}
