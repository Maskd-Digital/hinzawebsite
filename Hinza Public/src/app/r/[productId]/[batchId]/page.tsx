import { IntakeWizard } from "@/components/intake/IntakeWizard";

type PageProps = {
  params: Promise<{ productId: string; batchId: string }>;
  searchParams: Promise<{ loc?: string; src?: string }>;
};

export default async function ReportPage({ params, searchParams }: PageProps) {
  const { productId, batchId } = await params;
  const { loc } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <IntakeWizard
        productId={productId}
        batchId={batchId}
        outletId={loc ?? null}
        initialContext={null}
        loadError={null}
        autoLoad
      />
    </main>
  );
}
