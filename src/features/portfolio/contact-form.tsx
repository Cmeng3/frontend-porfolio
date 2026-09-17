"use client";
import { useRef, useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const feedback = useRef<HTMLDivElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
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
          body: JSON.stringify(values),
          signal: AbortSignal.timeout(15000),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 422) setErrors(data.errors || {});
        throw new Error(
          response.status === 429
            ? "Please wait a minute before sending another message. Your message is still here."
            : response.status === 422
              ? "Please check the highlighted fields and try again."
              : "The message service is unavailable. Your message is still here; please try again later.",
        );
      }
      setSent(true);
      setStatus("Thank you. Your message has been received.");
      form.reset();
      setSubject("");
    } catch (error) {
      setStatus(
        error instanceof TypeError ||
          (error instanceof Error &&
            ["TimeoutError", "AbortError"].includes(error.name))
          ? "We couldn't confirm delivery. Your message is still here. Check your connection before trying again."
          : error instanceof Error
            ? error.message
            : "Unable to send your message. Please try again.",
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  if (sent)
    return (
      <div
        className="contact-compose contact-success"
        ref={feedback}
        tabIndex={-1}
      >
        <span className="contact-success-mark" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">Message received</p>
        <h2>Thanks for reaching out.</h2>
        <p role="status">{status}</p>
        <p className="muted">
          I’ll review your message and can reply using the email address you
          provided.
        </p>
        <button
          className="button secondary"
          onClick={() => {
            setSent(false);
            setStatus("");
          }}
        >
          Send another message
        </button>
      </div>
    );
  return (
    <div className="contact-compose">
      <div className="contact-compose-heading">
        <div>
          <p className="eyebrow">Start a conversation</p>
          <h2>Send me a message</h2>
        </div>
        <span className="contact-note">* Required</span>
      </div>
      <p className="muted">
        Tell me about the role, your project, or what you’d like to discuss.
      </p>
      <form
        onSubmit={submit}
        className="contact-form contact-message-form"
        aria-busy={busy}
      >
        <fieldset disabled={busy} className="contact-fields">
          <legend className="sr-only">Your contact details and message</legend>
          <div className="contact-input-row">
            {[
              ["name", "Name", "text", "Your name"],
              ["email", "Email", "email", "you@example.com"],
            ].map(([name, label, type, placeholder]) => (
              <div key={name}>
                <label htmlFor={name}>{label} *</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  required
                  maxLength={name === "name" ? 150 : 255}
                  autoComplete={name}
                  placeholder={placeholder}
                  aria-invalid={!!errors[name]}
                  aria-describedby={
                    errors[name]
                      ? name + "-error"
                      : name === "email"
                        ? "contact-email-hint"
                        : undefined
                  }
                />
                {name === "email" && (
                  <p id="contact-email-hint" className="contact-hint">
                    Where I can reply to you.
                  </p>
                )}
                {errors[name] && (
                  <p id={name + "-error"} className="field-error">
                    {errors[name].join(" ")}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="subject">
              Subject <span className="contact-optional">(optional)</span>
            </label>
            <div
              className="contact-topics"
              role="group"
              aria-label="Suggested message topics"
            >
              {["Job opportunity", "Project collaboration", "A question"].map(
                (topic) => (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={subject === topic}
                    onClick={() => setSubject(topic)}
                  >
                    {topic}
                  </button>
                ),
              )}
            </div>
            <input
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
              placeholder="What would you like to discuss?"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
            />
            {errors.subject && (
              <p id="subject-error" className="field-error">
                {errors.subject.join(" ")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              minLength={10}
              maxLength={10000}
              placeholder="A little context is helpful: the role or project, what you’re looking for, and any useful links."
              aria-invalid={!!errors.message}
              aria-describedby={
                errors.message ? "message-error" : "contact-message-hint"
              }
            />
            <p id="contact-message-hint" className="contact-hint">
              At least 10 characters.
            </p>
            {errors.message && (
              <p id="message-error" className="field-error">
                {errors.message.join(" ")}
              </p>
            )}
          </div>
          <div hidden>
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="contact-submit-row">
            <button className="button" disabled={busy}>
              {busy ? "Sending…" : "Send message"}
            </button>
            <p className="contact-hint">
              Your details are used to respond to your message.
            </p>
          </div>
        </fieldset>
        <div ref={feedback} tabIndex={-1}>
          {status && (
            <p role="alert" className="contact-feedback">
              {status}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
