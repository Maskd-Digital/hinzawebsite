"use client";

import Image from "next/image";
import { useState } from "react";
import { SOCIAL } from "@/lib/site-content";

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

export function ContactFooter() {
  const [sent, setSent] = useState(false);

  function handleSend() {
    setSent(true);
  }

  return (
    <section
      id="contact"
      className="rounded-t-[28px]"
      style={{ background: "#1A0FD4", color: "#fff" }}
    >
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
        <div className="flex flex-col gap-5">
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
              type="text"
              placeholder="Enter your name here"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cf-email" className="text-[13px] font-semibold text-white">
              Email
            </label>
            <input
              id="cf-email"
              type="email"
              placeholder="Enter your email here"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cf-msg" className="text-[13px] font-semibold text-white">
              Message
            </label>
            <textarea
              id="cf-msg"
              rows={5}
              placeholder="Type your message here"
              className={`min-h-[120px] resize-y ${inputClass}`}
              style={inputStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            className="mt-2 self-end rounded-xl px-8 py-3.5 text-[14.5px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "#1208A8" }}
          >
            Send Message
          </button>

          {sent && (
            <p role="status" style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              Thanks — we&rsquo;ll be in touch shortly.
            </p>
          )}
        </div>
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
