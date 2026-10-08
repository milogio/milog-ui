import { accountError, accountJson, accountSession, getEntitlementServer } from "@/lib/accountServer";

export async function GET() {
  try {
    const session = await accountSession();
    return accountJson({ data: await getEntitlementServer(session) });
  } catch (error) {
    return accountError(error);
  }
}
