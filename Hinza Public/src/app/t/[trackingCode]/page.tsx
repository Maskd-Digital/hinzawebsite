import { StatusLookup } from "@/components/intake/StatusLookup";

type PageProps = {
  params: Promise<{ trackingCode: string }>;
};

export default async function TrackingPage({ params }: PageProps) {
  const { trackingCode } = await params;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <StatusLookup initialCode={decodeURIComponent(trackingCode)} />
    </main>
  );
}
