const steps = [
  {
    n: "01",
    title: "Something's Wrong. Say It.",
    body:
      "File a complaint in seconds — attach photos, pick your location, and submit. Whether you're on the factory floor, in the warehouse, or out at a retail outlet, Hinza works wherever you are. No emails, no WhatsApp threads, no shouting across the floor. Just tap, describe, and send.",
  },
  {
    n: "02",
    title: "The Right People Are On It.",
    body:
      "The moment a complaint lands, it gets assigned to the right investigator automatically. Your QA team reviews, tracks, and submits their Root Cause Analysis and Corrective Action — all in one place.",
  },
  {
    n: "03",
    title: "Case Closed. For Good.",
    body:
      "The QA manager reviews the resolution, closes the case, and collects feedback. Every complaint leaves behind a clean, documented trail — so the same issue never comes back to haunt you.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="bg-page">
      <div
        className="mx-auto flex flex-col items-center"
        style={{ maxWidth: 1000, padding: "40px 40px 96px" }}
      >
        <h2
          className="mb-14 text-center"
          style={{
            fontSize: 38,
            fontWeight: 800,
            lineHeight: "44px",
            letterSpacing: "-0.8px",
            color: "#1A0FD4",
          }}
        >
          <span style={{ color: "#1A0FD4" }}>Three</span> Steps. Zero Chaos.
        </h2>

        <ol className="flex w-full flex-col gap-8">
          {steps.map((s) => (
            <li key={s.n} className="relative">
              {/* Floating royal blue tab */}
              <div
                className="relative z-10 inline-flex items-center gap-4 rounded-xl"
                style={{
                  background: "#1A0FD4",
                  color: "#fff",
                  padding: "12px 24px",
                  marginLeft: -18,
                  marginBottom: -16,
                  boxShadow: "0 6px 18px -8px rgba(26,15,212,0.4)",
                }}
              >
                <span
                  className="font-extrabold opacity-80"
                  style={{ fontSize: 13, letterSpacing: "0.5px" }}
                >
                  {s.n}
                </span>
                <span
                  aria-hidden
                  style={{
                    width: 1,
                    height: 14,
                    background: "rgba(255,255,255,0.3)",
                  }}
                />
                <span
                  className="font-bold"
                  style={{ fontSize: 14.5, letterSpacing: "-0.1px" }}
                >
                  {s.title}
                </span>
              </div>

              {/* Body card */}
              <div
                className="rounded-[16px]"
                style={{
                  background: "#fff",
                  boxShadow: "0 8px 30px -10px rgba(11,31,77,0.12)",
                  padding: "32px 36px 28px",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: "23px",
                    color: "#5A6273",
                  }}
                >
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
