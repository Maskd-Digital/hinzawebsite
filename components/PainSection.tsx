import Image from "next/image";

const cards = [
  {
    title: "Inefficient Complaint\nResolution.",
    body:
      "Organizations often struggle to resolve complaints quickly because information is scattered across multiple channels. This inefficiency leads to delays, confusion, and higher operational costs.",
    image: "/images/pain-inefficient.png",
    alt: "Inefficient complaint resolution illustration",
  },
  {
    title: "Lack of Trust &\nTransparency",
    body:
      "Employees who submit complaints frequently feel ignored due to a lack of transparency and updates. Without clear communication, trust erodes and people hesitate to report future issues.",
    image: "/images/pain-trust.png",
    alt: "Lack of trust and transparency illustration",
  },
];

export function PainSection() {
  return (
    <section className="bg-page">
      <div
        className="mx-auto flex flex-col items-center text-center"
        style={{ maxWidth: 1100, padding: "40px 40px 96px" }}
      >
        <h2
          className="mb-14"
          style={{
            fontSize: 38,
            fontWeight: 800,
            lineHeight: "44px",
            letterSpacing: "-0.8px",
            color: "#1A0FD4",
            maxWidth: 800,
          }}
        >
          The <span style={{ color: "#1A0FD4" }}>Reasons</span> Your QA Team Is
          Exhausted.
        </h2>

        <div className="grid w-full grid-cols-1 gap-y-10 pt-6 md:grid-cols-2 md:gap-x-16 md:gap-y-10">
          {cards.map((card) => (
            <article
              key={card.title}
              className="relative flex flex-col items-center overflow-visible rounded-[20px] text-center"
              style={{
                background: "#FEFEFE",
                boxShadow: "0 8px 30px -10px rgba(11,31,77,0.12)",
                padding: "32px 30px 36px",
              }}
            >
              <div
                className="relative z-[1] -mt-14 mb-4 flex w-full items-end justify-center"
                style={{ height: 240 }}
              >
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={500}
                  height={360}
                  className="h-full max-h-[248px] w-auto origin-bottom scale-[1.14] object-contain object-bottom [filter:drop-shadow(0_16px_32px_rgba(11,31,77,0.16))]"
                />
              </div>

              <h3
                className="mb-3 whitespace-pre-line"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: "28px",
                  letterSpacing: "-0.4px",
                  color: "#1A0FD4",
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: "22px",
                  color: "#5A6273",
                  maxWidth: 360,
                }}
              >
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
