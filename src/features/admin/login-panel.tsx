"use client";
import { useState, type FormEvent } from "react";
import { adminRequest } from "@/services/admin";
export function LoginPanel({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminRequest(
        "login",
        "POST",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="login-panel">
      <p className="eyebrow">Private workspace</p>
      <h1>Portfolio administration</h1>
      <p className="muted">Sign in to manage your content.</p>
      <form onSubmit={submit} className="contact-form">
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p role="alert" className="error-message">
          {error}
        </p>
      </form>
    </section>
  );
}
