import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, GoogleButton } from "@/components/auth-kit";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/auth/founder/login")({
  head: () => ({
    meta: [
      { title: "Founder sign in — Venture Connect" },
      {
        name: "description",
        content: "Sign in to your Venture Connect founder workspace to keep building your venture.",
      },
      { property: "og:title", content: "Founder sign in — Venture Connect" },
      { property: "og:description", content: "Founder access to Venture Connect." },
    ],
  }),
  component: FounderLogin,
});

function FounderLogin() {
  return (
    <AuthShell
      title="Welcome back, founder"
      subtitle="Sign in to your founder workspace."
      footer={
        <>
          New here?{" "}
          <Link to="/auth/founder/signup" className="underline underline-offset-4">
            Create a founder account
          </Link>
          {" · "}
          <Link to="/auth/forgot-password" className="underline underline-offset-4">
            Forgot password
          </Link>
          {" · "}
          <Link to="/auth/partner/login" className="underline underline-offset-4">
            Partner sign in
          </Link>
        </>
      }
    >
      <LoginForm role="founder" />
      <GoogleButton role="founder" />
    </AuthShell>
  );
}
