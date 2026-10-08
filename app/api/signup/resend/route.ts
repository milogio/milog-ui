import { accountBody, accountError, accountJson, resendSignupServer } from "@/lib/accountServer";
import { MiLogServerError } from "@/lib/milogServer";

export async function POST(request: Request) {
  try {
    const body = await accountBody(request);
    if (typeof body.email !== "string" || !body.email.trim()) throw new MiLogServerError("Email is required.", 422, "validation");
    await resendSignupServer(body.email);
    return accountJson({ message: "If this address has a pending signup, check your email for a new link." }, 202);
  } catch (error) {
    return accountError(error);
  }
}
