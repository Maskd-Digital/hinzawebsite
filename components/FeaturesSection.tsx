import Image from "next/image";

type Feature = {
  title: string;
  src: string;
};

const features: Feature[] = [
  { title: "Complaint\nSubmission", src: "/images/complaint-submission.png" },
  { title: "Analytics &\nDashboards", src: "/images/feat-analytics.png" },
  { title: "Real Time\nNotifications", src: "/images/feat-notifications.png" },
  { title: "RCA & CAPA\nManagement", src: "/images/feat-rca.png" },
  { title: "Complaint\nAssignment", src: "/images/feat-assignment.png" },
  { title: "Audit Ready\nDocumentation", src: "/images/feat-audit.png" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-page">
      <div
        className="mx-auto flex flex-col items-center"
        style={{ maxWidth: 1100, padding: "40px 40px 96px" }}
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
          The <span style={{ color: "#1A0FD4" }}>Features</span> That Fix the
          Chaos.
        </h2>

        <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.title}
              className="flex flex-col items-center rounded-[20px] bg-[#FEFEFE] text-center transition-transform duration-300 hover:-translate-y-1"
              style={{
                boxShadow: "0 8px 30px -10px rgba(11,31,77,0.12)",
                padding: "26px 28px 28px",
                minHeight: 200,
              }}
            >
              <div
                className="mb-5 flex w-full items-center justify-center"
                style={{ height: 100 }}
              >
                <Image
                  src={f.src}
                  alt={f.title.replace(/\n/g, " ")}
                  width={168}
                  height={168}
                  className="h-full w-auto max-h-[100px] object-contain"
                />
              </div>
              <h3
                className="mt-auto w-full whitespace-pre-line text-center font-extrabold text-[#1A0FD4]"
                style={{
                  fontSize: 18,
                  lineHeight: "22px",
                  letterSpacing: "-0.2px",
                }}
              >
                {f.title}
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
