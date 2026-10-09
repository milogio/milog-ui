import type { Metadata } from "next";
import documents from "@/lib/legalDocuments.json";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "MiLog Privacy Policy",
  description: "How MiLog handles personal information. Effective October 8, 2026.",
};

export default function PrivacyPage() {
  return <LegalDocument document={documents.privacy} />;
}
