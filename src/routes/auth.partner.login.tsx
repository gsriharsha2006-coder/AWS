import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, GoogleButton } from "@/components/auth-kit";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/auth/partner/login")({
  head: () => ({
    meta: [
      { title: "Partner sign in — Venture Connect" },
      {
        name: "description",
        content:
          "Sign in to your Venture Connect partner console to post opportunities and review applications.",
      },
      { property: "og:title", content: "Partner sign in — Venture Connect" },
      { property: "og:description", content: "Ecosystem partner access to Venture Connect." },
    ],
  }),
  component: PartnerLogin,
});

function PartnerLogin() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your ecosystem partner console."
      footer={
        <>
          New organization?{" "}
          <Link to="/auth/partner/signup" className="underline underline-offset-4">
            Create a partner account
          </Link>
          {" · "}
          <Link to="/auth/forgot-password" className="underline underline-offset-4">
            Forgot password
          </Link>
          {" · "}
          <Link to="/auth/founder/login" className="underline underline-offset-4">
            Founder sign in
          </Link>
        </>
      }
    >
      <LoginForm role="partner" />
      <GoogleButton role="partner" />
    </AuthShell>
  );
}
