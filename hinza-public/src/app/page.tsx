import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">Hinza</p>
      <h1 className="text-2xl font-bold leading-tight text-[#081636] sm:text-3xl">
        Public product complaint intake
      </h1>
      <p className="text-sm text-gray-600">
        Scan a product QR code to report an issue. If you already have a tracking code, check status
        below.
      </p>
      <Link href="/status" className="btn-primary inline-flex w-fit px-4 py-2.5">
        Track a complaint
      </Link>
    </main>
  );
}
