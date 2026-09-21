import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { readSession } from "@/lib/milogServer";
import { safeInternalPath } from "@/lib/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next);
  const session = await readSession();
  if (session) redirect(nextPath);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="relative z-10 flex w-full justify-center">
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
