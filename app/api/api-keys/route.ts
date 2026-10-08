import type { ApiKeyCreateRequest } from "@/lib/apiContract";
import { accountBody, accountError, accountJson, accountSession, createApiKeyServer, listApiKeysServer, requireKeyManager } from "@/lib/accountServer";
import { MiLogServerError } from "@/lib/milogServer";

export async function GET() {
  try {
    const session = await accountSession();
    requireKeyManager(session);
    return accountJson({ data: await listApiKeysServer(session) });
  } catch (error) {
    return accountError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await accountSession();
    requireKeyManager(session);
    const body = await accountBody(request);
    if (typeof body.name !== "string" || !body.name.trim() || body.kind !== "temporary" || typeof body.password !== "string" || !body.password) {
      throw new MiLogServerError("A name and current password are required for a temporary key.", 422, "validation");
    }
    const result = await createApiKeyServer(body as ApiKeyCreateRequest, session);
    return accountJson(result, 201);
  } catch (error) {
    return accountError(error);
  }
}
