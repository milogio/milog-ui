import { redirect } from "next/navigation";
import { readSession } from "@/lib/milogServer";

export default async function Home() {
  const session = await readSession();
  redirect(session ? "/timeline" : "/login");
}
