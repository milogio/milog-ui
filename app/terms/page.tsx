import type { Metadata } from "next";
import documents from "@/lib/legalDocuments.json";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "MiLog Terms of Service",
  description: "Terms governing access to and use of MiLog. Effective October 8, 2026.",
};

export default function TermsPage() {
  return <LegalDocument document={documents.terms} />;
}
