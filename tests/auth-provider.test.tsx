import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

function AuthHarness() {
  const { user, tenant, entitlement, loading, sessionMessage, refresh, logout, setSession } = useAuth();
  const [, setRenderCount] = useState(0);
  return (
    <div>
      <output data-testid="auth-state">{loading ? "loading" : user?.email ?? "signed-out"}</output>
      <output data-testid="tenant-state">{tenant?.name ?? "no-tenant"}</output>
      <output data-testid="entitlement-state">{entitlement?.state ?? "no-entitlement"}</output>
      <output data-testid="session-message">{sessionMessage ?? "no-message"}</output>
      <button
        onClick={() => {
          setSession({
            user: { id: "1", name: "Chris", email: "chrsc@example.com", tenant_id: "tenant-1" },
            tenant: { id: "tenant-1", name: "Callender", role: "owner" },
          });
          setRenderCount((value) => value + 1);
        }}
      >
        Complete login
      </button>
      <button onClick={() => void refresh()}>Refresh session</button>
      <button onClick={() => void logout()}>Log out</button>
    </div>
  );
}

describe("AuthProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not let a stale pre-login session request erase a successful login", async () => {
    const pendingSession = deferred<Response>();
    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingSession.promise);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Complete login" }));
    expect(screen.getByTestId("auth-state")).toHaveTextContent("chrsc@example.com");

    await act(async () => {
      pendingSession.resolve(new Response(JSON.stringify({ message: "Unauthenticated" }), { status: 401 }));
      await pendingSession.promise;
    });

    expect(screen.getByTestId("auth-state")).toHaveTextContent("chrsc@example.com");
  });

  it("restores the user and tenant from the server session", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      user: { id: "1", name: "Chris", email: "chrsc@example.com", tenant_id: "tenant-1" },
      tenant: { id: "tenant-1", name: "Callender", role: "owner" },
    }), { status: 200 }));

    render(<AuthProvider><AuthHarness /></AuthProvider>);

    expect(await screen.findByText("chrsc@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("tenant-state")).toHaveTextContent("Callender");
  });

  it("loads entitlement after session restoration", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (input === "/api/auth/session") return new Response(JSON.stringify({
        user: { id: "1", name: "Ada", email: "ada@example.com", tenant_id: "tenant-1" },
        tenant: { id: "tenant-1", name: "Acme", role: "owner" },
      }));
      return new Response(JSON.stringify({ data: {
        state: "evaluation", trial_ends_at: null, billing_status: "none", paid_through_at: null,
        grace_ends_at: null, can_create_temporary_key: true, can_create_paid_key: false,
      } }));
    });
    render(<AuthProvider><AuthHarness /></AuthProvider>);
    expect(await screen.findByText("evaluation")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/entitlement", expect.objectContaining({ cache: "no-store" }));
  });

  it("surfaces an expired-session message and clears identity", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      message: "Your session has expired. Please sign in again.",
    }), { status: 401 }));

    render(<AuthProvider><AuthHarness /></AuthProvider>);

    expect(await screen.findByText("signed-out")).toBeInTheDocument();
    expect(screen.getByTestId("session-message")).toHaveTextContent("Your session has expired");
    expect(screen.getByTestId("tenant-state")).toHaveTextContent("no-tenant");
  });

  it("logs out through the BFF and clears the restored tenant context", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (input === "/api/auth/session") return new Response(JSON.stringify({
        user: { id: "1", name: "Chris", email: "chrsc@example.com", tenant_id: "tenant-1" },
        tenant: { id: "tenant-1", name: "Callender", role: "owner" },
      }), { status: 200 });
      if (input === "/api/entitlement") return new Response(JSON.stringify({ data: { state: "evaluation" } }));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    const user = userEvent.setup();

    render(<AuthProvider><AuthHarness /></AuthProvider>);
    expect(await screen.findByText("chrsc@example.com")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("signed-out"));
    expect(screen.getByTestId("tenant-state")).toHaveTextContent("no-tenant");
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });
});
