import { accountError, accountSession, requireKeyManager, revokeApiKeyServer } from "@/lib/accountServer";
import { MiLogServerError } from "@/lib/milogServer";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await accountSession();
    requireKeyManager(session);
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new MiLogServerError("Invalid API key identifier.", 400, "validation");
    await revokeApiKeyServer(id, session);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return accountError(error);
  }
}
