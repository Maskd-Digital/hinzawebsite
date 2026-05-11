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

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={i}
              className="flex flex-col items-center rounded-[20px] text-center"
              style={{
                background: "#fff",
                boxShadow: "0 8px 30px -10px rgba(11,31,77,0.12)",
                padding: "24px 24px 30px",
              }}
            >
              <div
                className="mb-5 flex w-full items-center justify-center rounded-[14px] bg-[#FEFEFE]"
                style={{ height: 140 }}
              >
                <Image
                  src={item.image}
                  alt=""
                  width={300}
                  height={220}
                  className="h-full w-auto object-contain"
                />
              </div>
              <p
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
