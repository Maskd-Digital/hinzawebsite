"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SOCIAL } from "@/lib/site-content";

type Toast = { kind: "success" | "error"; message: string };

function ContactToast({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  useEffect(() => {
    if (toast.kind !== "success") return;
    const id = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(id);
  }, [toast.kind, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSuccess = toast.kind === "success";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0a0640]/55 backdrop-blur-[2px] transition-opacity"
        aria-label="Close notification"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="contact-toast-title"
        aria-describedby="contact-toast-desc"
        className="relative w-full max-w-[400px] rounded-2xl px-6 py-6 shadow-cta transition-all duration-200 ease-out"
        style={{
          background: isSuccess ? "#fff" : "#1a1030",
          color: isSuccess ? "#1A0FD4" : "#fff",
          border: isSuccess
            ? "1px solid rgba(26,15,212,0.12)"
            : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[18px] leading-none opacity-50 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          ×
        </button>
        <div
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-full text-[20px]"
          style={{
            background: isSuccess ? "rgba(26,15,212,0.1)" : "rgba(255,80,80,0.2)",
          }}
          aria-hidden
        >
          {isSuccess ? "✓" : "!"}
        </div>
        <h4
          id="contact-toast-title"
          className="pr-8 text-[17px] font-extrabold tracking-tight"
        >
          {isSuccess ? "Message sent" : "Could not send"}
        </h4>
        <p
          id="contact-toast-desc"
          className="mt-2 text-[14px] leading-relaxed"
          style={{ color: isSuccess ? "rgba(26,15,212,0.75)" : "rgba(255,255,255,0.85)" }}
        >
          {toast.message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl py-3 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
          style={{ background: isSuccess ? "#1A0FD4" : "#c42b2b" }}
        >
          {isSuccess ? "Got it" : "Try again"}
        </button>
      </div>
    </div>
  );
}

function LinkedInIcon() {
  return (
    <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl px-4 py-3 text-[14px] text-ink-soft outline-none placeholder:text-ink-muted/85 focus:border-[#1A0FD4]/35 focus:outline-none focus:ring-2 focus:ring-white/40";
const inputStyle: React.CSSProperties = {
  background: "#E7ECFB",
  border: "1px solid rgba(26,15,212,0.18)",
};

function isFormComplete(name: string, email: string, message: string) {
  const n = name.trim();
  const e = email.trim();
  const m = message.trim();
  if (!n || !e || !m) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function ContactFooter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(false);

  const formComplete = isFormComplete(name, email, message);

  async function submitForm() {
    setToast(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setToast({
          kind: "error",
          message: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }
      setToast({
        kind: "success",
        message: "Thanks — we'll be in touch shortly.",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setToast({
        kind: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitForm();
  }

  return (
    <section
      id="contact"
      className="rounded-t-[28px]"
      style={{ background: "#1A0FD4", color: "#fff" }}
    >
      {toast && <ContactToast toast={toast} onClose={() => setToast(null)} />}
      <div className="mx-auto box-border grid w-full max-w-[min(100%,1340px)] grid-cols-1 gap-14 px-3 pb-10 pt-[72px] sm:px-4 lg:grid-cols-2 lg:gap-20 lg:px-5">
        {/* Left — pitch */}
        <div className="flex flex-col">
          <div className="mb-7 flex items-center">
            <Image
              src="/images/Hinza-Logo-white.png"
              alt="Hinza"
              width={220}
              height={64}
              className="h-12 w-auto md:h-14"
            />
          </div>

          <p
            className="mb-6 italic"
            style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 30,
              lineHeight: "38px",
              color: "#fff",
              maxWidth: 520,
            }}
          >
            Let Your Team Raise Issues.
            <br />
            Let Hinza Fix the Process.
          </p>

          <p
            className="mb-8 text-justify"
            style={{
              fontSize: 14,
              lineHeight: "22px",
              color: "rgba(255,255,255,0.85)",
              maxWidth: 460,
            }}
          >
            From the factory floor to the boardroom, Hinza keeps every complaint
            on record, every case on track, and every audit trail clean. Designed
            for QA teams in manufacturing, FMCG, pharma, apparel and all medium
            to large scale organizations.
          </p>

          <div className="mt-auto flex flex-wrap gap-6">
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/90 transition-opacity hover:text-white hover:opacity-90"
              style={{ textDecoration: "none" }}
            >
              <LinkedInIcon />
              LinkedIn
            </a>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/90 transition-opacity hover:text-white hover:opacity-90"
              style={{ textDecoration: "none" }}
            >
              <InstagramIcon />
              Instagram
            </a>
          </div>
        </div>

        {/* Right — Contact form */}
        <form className="flex flex-col gap-5" onSubmit={onFormSubmit}>
          <h3
            className="font-extrabold"
            style={{ fontSize: 26, letterSpacing: "-0.4px", color: "#fff" }}
          >
            Contact Us
          </h3>

          <div className="flex flex-col gap-2">
            <label htmlFor="cf-name" className="text-[13px] font-semibold text-white">
              Name
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name here"
              className={inputClass}
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cf-email" className="text-[13px] font-semibold text-white">
              Email
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email here"
              className={inputClass}
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cf-msg" className="text-[13px] font-semibold text-white">
              Message
            </label>
            <textarea
              id="cf-msg"
              name="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here"
              className={`min-h-[120px] resize-y ${inputClass}`}
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formComplete}
            className={[
              "mt-2 self-end rounded-xl px-8 py-3.5 text-[14.5px] font-bold text-white",
              "transition-all duration-200 ease-out",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:translate-y-0 disabled:scale-100",
              formComplete && !loading
                ? "bg-brand-blue-dark shadow-cta hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#2a18d4] hover:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.4)] active:translate-y-0 active:scale-[0.98] active:shadow-cta"
                : "bg-brand-blue-dark/70 opacity-80",
            ].join(" ")}
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>

      <div
        className="mx-auto box-border w-full max-w-[min(100%,1340px)] px-3 py-[18px] text-center sm:px-4 lg:px-5"
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        Designed &amp; Developed By{" "}
        <a
          href="https://maskd.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white/75 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60"
          style={{ textDecorationThickness: 1 }}
        >
          Mask&rsquo;d
        </a>
      </div>
    </section>
  );
}
