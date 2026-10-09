import { connection } from "next/server";
import { MarketingPage } from "@/components/landing/MarketingPage";
import { approvedTermsUrl } from "@/lib/terms";

export default async function Page() {
  await connection();
  return <MarketingPage signupAvailable={Boolean(approvedTermsUrl())} />;
}
