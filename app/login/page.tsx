import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { readSession } from "@/lib/milogServer";

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect("/timeline");

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(20,184,166,0.18),_transparent_26%)]" />
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </main>
  );
}
