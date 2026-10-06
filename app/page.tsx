import { CodeSection } from "@/components/landing/CodeSection";
import { Features } from "@/components/landing/Features";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { Nav } from "@/components/landing/Nav";
import { Pricing } from "@/components/landing/Pricing";
import { TrustedBy } from "@/components/landing/TrustedBy";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrustedBy />
      <InteractiveDemo />
      <Features />
      <CodeSection />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
