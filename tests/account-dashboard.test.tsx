import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountDashboard } from "@/components/AccountDashboard";

const api = vi.hoisted(() => ({
  getEntitlement: vi.fn(), listApiKeys: vi.fn(), createApiKey: vi.fn(), revokeApiKey: vi.fn(),
}));
const auth = vi.hoisted(() => ({ role: "owner" as "owner" | "admin" | "member" }));
vi.mock("@/lib/accountApi", async (original) => ({ ...await original(), ...api }));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Ada", email: "ada@example.com", tenant_id: "tenant-1" },
    tenant: { id: "tenant-1", name: "Acme", role: auth.role },
    loading: false,
  }),
}));
vi.mock("@/components/ProtectedRoute", () => ({ ProtectedRoute: ({ children }: { children: React.ReactNode }) => children }));

const entitlement = {
  state: "evaluation", trial_ends_at: "2026-10-21T12:00:00Z", billing_status: "none",
  paid_through_at: null, grace_ends_at: null, can_create_temporary_key: true, can_create_paid_key: false,
};
const key = {
  id: "4b85ed15-f973-4ca9-bb7c-f2d825ef20d7", name: "Production", key_prefix: "milog_abc",
  kind: "temporary", status: "active", created_at: "2026-10-08T12:00:00Z",
  expires_at: "2026-10-15T12:00:00Z", revoked_at: null, last_used_at: null,
};

describe("account credentials", () => {
  beforeEach(() => {
    auth.role = "owner";
    api.getEntitlement.mockResolvedValue(entitlement);
    api.listApiKeys.mockResolvedValue([key]);
  });
  afterEach(() => { vi.clearAllMocks(); vi.restoreAllMocks(); });

  it("shows entitlement to members without key controls or key-list calls", async () => {
    auth.role = "member";
    render(<AccountDashboard />);
    expect(await screen.findByText("evaluation", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/Only an owner or admin/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create temporary key" })).not.toBeInTheDocument();
    expect(api.listApiKeys).not.toHaveBeenCalled();
  });

  it("shows a new raw key once, clears the password, and confirms revocation", async () => {
    api.createApiKey.mockResolvedValue({ data: key, api_key: "milog_secret-once" });
    api.revokeApiKey.mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<AccountDashboard />);
    expect(await screen.findByText("milog_abc")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Key name" }), "Production");
    const password = screen.getByLabelText("Current password") as HTMLInputElement;
    await user.type(password, "current-password");
    await user.click(screen.getByRole("button", { name: "Create temporary key" }));
    expect(await screen.findByTestId("one-time-api-key")).toHaveTextContent("milog_secret-once");
    expect(api.createApiKey).toHaveBeenCalledWith("Production", "current-password");
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "I saved it" }));
    expect(screen.queryByText("milog_secret-once")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Revoke Production" }));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("next API request"));
    await waitFor(() => expect(api.revokeApiKey).toHaveBeenCalledWith(key.id));
  });
});
