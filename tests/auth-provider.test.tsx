import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
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
  const { user, loading, setSession } = useAuth();
  const [, setRenderCount] = useState(0);
  return (
    <div>
      <output data-testid="auth-state">{loading ? "loading" : user?.email ?? "signed-out"}</output>
      <button
        onClick={() => {
          setSession({
            user: { id: "1", name: "Chris", email: "chrsc@example.com", tenant_id: "tenant-1" },
            tenant: { id: "tenant-1", name: "Callender" },
          });
          setRenderCount((value) => value + 1);
        }}
      >
        Complete login
      </button>
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
});
