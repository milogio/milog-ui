import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { readSession } from "@/lib/milogServer";

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect("/timeline");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="relative z-10 flex w-full justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
