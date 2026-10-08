import type { ApiSignupRequest } from "@/lib/apiContract";
import { accountBody, accountError, accountJson, signupServer } from "@/lib/accountServer";
import { MiLogServerError } from "@/lib/milogServer";
import { approvedTermsUrl } from "@/lib/terms";

export async function POST(request: Request) {
  try {
    if (!approvedTermsUrl()) throw new MiLogServerError("Signup is not available yet.", 503, "configuration");
    const body = await accountBody(request);
    if (typeof body.name !== "string" || typeof body.tenant_name !== "string" || typeof body.email !== "string" ||
        typeof body.password !== "string" || typeof body.password_confirmation !== "string" || body.terms_accepted !== true) {
      throw new MiLogServerError("Complete all signup fields and accept the terms.", 422, "validation");
    }
    await signupServer(body as ApiSignupRequest);
    return accountJson({ message: "If this address can be used, check your email for the next step." }, 202);
  } catch (error) {
    return accountError(error);
  }
}
