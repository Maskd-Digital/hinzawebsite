import Image from "next/image";

const items = [
  {
    text: "Medium to large organizations with recurring product or service complaints",
    image: "/images/who-medium.png",
  },
  {
    text: "Companies with distributed operations (factories, warehouses, logistics, retail outlets)",
    image: "/images/who-distributed.png",
  },
  {
    text: "Businesses with formal QA / QC teams and compliance requirements",
    image: "/images/who-compliance.png",
  },
];

export function WhoItsForSection() {
  return (
    <section id="who" className="bg-page">
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
          If This Is You, <span style={{ color: "#1A0FD4" }}>Hinza</span> Has Got
          Your Back
        </h2>

        <div className="grid w-full grid-cols-1 gap-y-10 gap-x-6 pt-6 md:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={i}
              className="relative flex flex-col items-center overflow-visible rounded-[20px] text-center"
              style={{
                background: "#fff",
                boxShadow: "0 8px 30px -10px rgba(11,31,77,0.12)",
                padding: "28px 24px 30px",
              }}
            >
              <div
                className="relative z-[1] -mt-12 mb-3 flex w-full items-end justify-center md:-mt-14"
                style={{ height: 200 }}
              >
                <Image
                  src={item.image}
                  alt=""
                  width={360}
                  height={260}
                  className="h-full max-h-[210px] w-auto origin-bottom scale-[1.12] object-contain object-bottom [filter:drop-shadow(0_14px_28px_rgba(11,31,77,0.16))] md:max-h-[220px] md:scale-[1.16]"
                />
              </div>
              <p
                className="relative z-[1]"
                style={{
                  fontSize: 14,
                  lineHeight: "21px",
                  fontWeight: 700,
                  color: "#1A0FD4",
                  maxWidth: 260,
                }}
              >
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
