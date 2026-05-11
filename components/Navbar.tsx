"use client";

import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Who It's For", href: "#who" },
  { label: "How It Works", href: "#how" },
];

export default function Navbar() {
  return (
    <nav className="relative z-20 w-full bg-page">
      <div className="mx-auto box-border flex w-full max-w-[min(100%,1340px)] flex-wrap items-center justify-between gap-x-6 gap-y-4 px-3 pt-5 pb-2 sm:px-4 md:pt-6 md:pb-3 lg:px-5">
        <Link
          href="/"
          className="relative flex shrink-0 items-center"
          style={{ textDecoration: "none" }}
        >
          <Image
            src="/images/Hinza-Logo-blue.png"
            alt="Hinza"
            width={200}
            height={56}
            className="h-9 w-auto md:h-10"
            priority
          />
        </Link>

        {/* Right-side text nav with vertical separators */}
        <div className="hidden items-center md:flex">
          {NAV_LINKS.map((link, i) => (
            <div key={link.label} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className="mx-6 inline-block"
                  style={{
                    width: 1,
                    height: 18,
                    background: "rgba(26,15,212,0.25)",
                  }}
                />
              )}
              <Link
                href={link.href}
                className="text-[14px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#1A0FD4", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
