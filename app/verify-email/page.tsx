import { VerifyEmail } from "@/components/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="relative z-10 flex w-full justify-center"><VerifyEmail /></div>
    </main>
  );
}
