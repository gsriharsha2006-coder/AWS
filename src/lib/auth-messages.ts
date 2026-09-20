/**
 * Logs the untouched error so it stays visible to developers in the browser
 * console / server logs, while the UI only ever shows a safe message.
 */
export function logAuthError(where: string, raw: unknown): void {
  const status = (raw as { status?: number } | null)?.status;
  const code = (raw as { code?: string } | null)?.code;
  console.error(`[auth:${where}]`, { status, code, error: raw });
}

/** Turns backend auth errors into plain, human-readable guidance. */
export function friendlyAuthError(raw: unknown, fallback: string): string {
  const message = (raw instanceof Error ? raw.message : String(raw ?? "")).toLowerCase();

  if (message.includes("missing supabase environment"))
    return "This copy of the app isn't connected to its backend, so accounts can't be created here. Use the main site, or ask the site owner to add the backend settings to this deployment.";
  if (message.includes("invalid login credentials"))
    return "That email and password combination didn't match an account. Check both and try again.";
  if (message.includes("email not confirmed"))
    return "This email hasn't been verified yet. Enter the code we emailed you to finish setting up the account.";
  if (message.includes("already registered") || message.includes("already exists"))
    return "An account already exists for this email. Sign in instead, or reset the password.";
  if (message.includes("signups not allowed") || message.includes("signup is disabled"))
    return "New sign-ups are currently switched off for this site. Please try again later.";
  if (message.includes("email address") && message.includes("invalid"))
    return "That email address was rejected. Check the spelling, or try a different address.";
  if (message.includes("email rate limit") || message.includes("over_email_send_rate_limit"))
    return "Too many verification emails have been sent in the last hour. Wait a little while, then try again.";
  if (message.includes("database error") || message.includes("unexpected_failure"))
    return "Your account could not be set up on our side. Please try again in a moment — if it keeps happening, contact support.";
  if (message.includes("token has expired") || message.includes("expired"))
    return "That code has expired. Request a new one and enter it within the next few minutes.";
  if (message.includes("invalid") && message.includes("token"))
    return "That code isn't valid. Check the six digits and try again.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts in a short time. Wait a minute, then try again.";
  if (message.includes("weak") || message.includes("pwned"))
    return "That password has appeared in a known data breach, so it can't be used. Please choose a different one.";
  if (message.includes("password"))
    return "That password doesn't meet the requirements: at least 8 characters with an uppercase letter, a lowercase letter and a number.";
  if (message.includes("failed to fetch") || message.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  return fallback;
}
