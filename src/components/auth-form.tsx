"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { browserDb } from "@/lib/supabase/client";
export function AuthForm({
  register = false,
  confirmationError = false,
}: { register?: boolean; confirmationError?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const db = browserDb();
      const email = String(data.get("email")).trim();
      const password = String(data.get("password"));
      const result = register
        ? await db.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: { display_name: String(data.get("name")) },
            },
          })
        : await db.auth.signInWithPassword({ email, password });
      if (result.error?.code === "email_not_confirmed") {
        setPendingEmail(email);
        return;
      }
      if (result.error)
        throw new Error(
          register
            ? "Registration could not be completed. Check your details or try signing in."
            : "Sign-in failed. Check your email and password.",
        );
      if (register && !result.data.session)
        setPendingEmail(email);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (pendingEmail) {
    return (
      <div className="auth-card">
        <h1>Check your email</h1>
        <p>Open the confirmation link sent to <strong>{pendingEmail}</strong> to finish setting up your account.</p>
        <p>Check your spam folder if you do not see the email. Open the link in the same browser you used to sign up.</p>
        {register ? <Link href="/sign-in">Go to sign in</Link> : (
          <button type="button" className="button" onClick={() => setPendingEmail("")}>Back to sign in</button>
        )}
      </div>
    );
  }
  return (
    <div className="auth-card">
      <Compass color="#0F766E" size={30} />
      <h1>{register ? "Make room for growth." : "Welcome back."}</h1>
      <p>
        {register
          ? "Create your NiaGuide account to keep your questions and saved answers."
          : "Sign in to return to your questions and saved perspectives."}
      </p>
      {confirmationError && (
        <p role="alert">We could not finish confirming your email. Try signing in if you already confirmed it. If sign-in says your email is unconfirmed, request a new confirmation email by creating your account again.</p>
      )}
      <form onSubmit={submit}>
        {register && (
          <div className="field">
            <label htmlFor="name">Display name</label>
            <input
              id="name"
              name="name"
              required
              maxLength={80}
              autoComplete="name"
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">
            Password {register && "(at least 12 characters)"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={register ? 12 : 1}
            maxLength={128}
            required
            autoComplete={register ? "new-password" : "current-password"}
          />
        </div>
        <button className="button" disabled={busy}>
          {busy ? "Connecting…" : register ? "Create account" : "Sign in"}
        </button>
      </form>
      <p role="status" style={{ marginTop: 16 }}>
        {message}
      </p>
      <p>
        {register ? "Already have an account?" : "New to NiaGuide?"}{" "}
        <Link href={register ? "/sign-in" : "/register"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
      <p>
        <Link href="/ask">Explore the demonstration →</Link>
      </p>
    </div>
  );
}
