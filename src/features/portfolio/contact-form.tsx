"use client";
import { useState, type FormEvent } from "react";
export function ContactForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setErrors({});
    setStatus("");
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") +
          "/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
          signal: AbortSignal.timeout(15000),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || {});
        throw new Error(
          response.status === 429
            ? "Too many messages. Please wait a minute and try again."
            : data.message || "Your message could not be sent.",
        );
      }
      setStatus(data.message);
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="contact-form">
      {[
        ["name", "Name", "text"],
        ["email", "Email", "email"],
        ["subject", "Subject", "text"],
        ["message", "Message", "textarea"],
      ].map(([name, label, type]) => (
        <label key={name} htmlFor={name}>
          {label}
          {name !== "subject" ? " *" : ""}
          {type === "textarea" ? (
            <textarea
              id={name}
              name={name}
              rows={7}
              required
              minLength={10}
              maxLength={10000}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? name + "-error" : undefined}
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              required={name !== "subject"}
              maxLength={name === "name" ? 150 : 255}
              autoComplete={
                name === "name" || name === "email" ? name : undefined
              }
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? name + "-error" : undefined}
            />
          )}{" "}
          {errors[name] && (
            <span className="field-error" id={name + "-error"}>
              {errors[name].join(" ")}
            </span>
          )}
        </label>
      ))}
      <div hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
