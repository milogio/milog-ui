import { accountBody, accountError, accountJson, verifySignupServer } from "@/lib/accountServer";
import { MiLogServerError } from "@/lib/milogServer";

export async function POST(request: Request) {
  try {
    const body = await accountBody(request);
    if (typeof body.token !== "string" || !body.token) throw new MiLogServerError("Verification link is missing.", 422, "validation", { apiCode: "invalid_verification" });
    await verifySignupServer(body.token);
    return accountJson({ message: "Email verified. You can now sign in." });
  } catch (error) {
    return accountError(error);
  }
}
