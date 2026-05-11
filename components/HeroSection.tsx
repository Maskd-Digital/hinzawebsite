import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="bg-page">
      <div
        className="mx-auto box-border flex min-h-[calc(100svh-5rem)] w-full max-w-[min(100%,1340px)] items-center px-3 py-4 pb-10 sm:px-4 sm:py-5 sm:pb-12 md:min-h-[calc(100svh-5.25rem)] lg:px-5"
      >
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-x-28 lg:gap-y-12 xl:gap-x-40">
          {/* Left — copy */}
          <div className="flex w-full flex-col items-start justify-center text-left lg:min-h-0">
            <h1
              className="mb-10 sm:mb-11"
              style={{
                fontSize: 56,
                fontWeight: 800,
                lineHeight: "62px",
                letterSpacing: "-1.75px",
                color: "#1A0FD4",
                maxWidth: 620,
              }}
            >
              Even The Best Products
              <br />
              Have A{" "}
              <em
                style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#1A0FD4",
                }}
              >
                Bad Day.
              </em>
            </h1>

            <p
              className="mb-9"
              style={{
                fontSize: 17,
                lineHeight: "26px",
                color: "#5A6273",
                maxWidth: 520,
              }}
            >
              Hinza is your QA team&rsquo;s superpower — catching complaints before they
              become catastrophes and turning chaos into closure.
            </p>

            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: "#1A0FD4",
                padding: "16px 32px",
                boxShadow: "0 12px 32px -10px rgba(26,15,212,0.45)",
                textDecoration: "none",
              }}
            >
              Book Demo
            </a>
          </div>

          {/* Right — phone + rock illustration */}
          <div className="flex w-full min-w-0 items-center justify-center lg:min-h-0 lg:justify-end">
            <Image
              src="/images/hero-phone-rock.png"
              alt="Hinza app on a phone resting against a rock"
              width={680}
              height={680}
              priority
              className="h-auto w-full max-w-[560px] object-contain sm:max-w-[600px] lg:ml-auto lg:max-w-[min(720px,calc(52vw-1rem))] lg:translate-x-8 xl:max-w-[760px] xl:translate-x-12 [filter:drop-shadow(0_22px_44px_rgba(11,31,77,0.13))]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
