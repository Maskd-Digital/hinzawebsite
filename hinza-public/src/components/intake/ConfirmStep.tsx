"use client";

type Props = {
  contactPhone: string;
  contactEmail: string;
  submitting: boolean;
  error: string | null;
  onPhone: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: () => void;
};

export function ConfirmStep({
  contactPhone,
  contactEmail,
  submitting,
  error,
  onPhone,
  onEmail,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[#081636]">Almost done</h2>
        <p className="text-sm text-gray-600">
          Submit to get a tracking code. Contact details are optional — never required.
        </p>
      </header>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#081636]">Phone (optional)</span>
        <input
          type="tel"
          className="input-hinza"
          value={contactPhone}
          onChange={(e) => onPhone(e.target.value)}
          autoComplete="tel"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#081636]">Email (optional)</span>
        <input
          type="email"
          className="input-hinza"
          value={contactEmail}
          onChange={(e) => onEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <div className="rounded-lg border border-gray-200 bg-[#EFF4FF] px-4 py-3 text-sm text-gray-600">
        After you submit, the product team reviews your report and may follow up if you left
        contact details. Keep your tracking code to check status later — no account needed.
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="btn-primary w-full py-3"
      >
        {submitting ? "Submitting…" : "Submit complaint"}
      </button>
    </div>
  );
}
