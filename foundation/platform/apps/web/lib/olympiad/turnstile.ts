/**
 * Verify Cloudflare Turnstile token server-side.
 * Returns true if valid, false otherwise.
 * Returns true if TURNSTILE_SECRET_KEY is not set (dev mode bypass).
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Dev mode: skip verification if no secret key
  if (!secretKey) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return false;
  }
}
