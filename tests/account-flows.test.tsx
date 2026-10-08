import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountApiError } from "@/lib/accountApi";
import { SignupForm } from "@/components/SignupForm";
import { VerifyEmail } from "@/components/VerifyEmail";

const api = vi.hoisted(() => ({ signup: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn() }));
vi.mock("@/lib/accountApi", async (original) => ({ ...await original(), ...api }));

describe("signup and email verification", () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("gates signup until terms are available", () => {
    render(<SignupForm termsUrl={null} />);
    expect(screen.getByText(/Signup is not available yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create account" })).not.toBeInTheDocument();
  });

  it("submits required acceptance and shows a generic email result", async () => {
    api.signup.mockResolvedValue({ message: "Check your email." });
    const user = userEvent.setup();
    render(<SignupForm termsUrl="https://milog.test/terms" />);
    await user.type(screen.getByRole("textbox", { name: "Owner name" }), "Ada");
    await user.type(screen.getByRole("textbox", { name: "Organization name" }), "Acme");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "long-unique-password");
    await user.type(screen.getByLabelText("Confirm password"), "long-unique-password");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(api.signup).toHaveBeenCalledWith(expect.objectContaining({
      name: "Ada", tenant_name: "Acme", email: "ada@example.com", terms_accepted: true,
    })));
    expect(await screen.findByText(/If the address can be used/)).toBeInTheDocument();
  });

  it("removes the token from history before posting and offers resend on failure", async () => {
    window.history.replaceState(null, "", "/verify-email?token=secret-token");
    api.verifyEmail.mockImplementation(async () => {
      expect(window.location.search).toBe("");
      throw new AccountApiError("Invalid verification link.", 422, "invalid_verification");
    });
    render(<VerifyEmail />);

    expect(await screen.findByText("Invalid verification link.")).toBeInTheDocument();
    expect(api.verifyEmail).toHaveBeenCalledWith("secret-token");
    expect(window.location.search).toBe("");
    expect(screen.getByRole("button", { name: "Resend verification email" })).toBeInTheDocument();
  });

  it("shows sign-in after successful verification", async () => {
    window.history.replaceState(null, "", "/verify-email?token=valid-token");
    api.verifyEmail.mockResolvedValue({ message: "Verified." });
    render(<VerifyEmail />);
    expect(await screen.findByText(/Your email is verified/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?from=signup");
  });
});
