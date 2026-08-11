"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CategoryStep } from "@/components/intake/CategoryStep";
import { FieldsStep } from "@/components/intake/FieldsStep";
import { StoryStep } from "@/components/intake/StoryStep";
import { ConfirmStep } from "@/components/intake/ConfirmStep";
import { resolveIntakeContext, submitPublicComplaint, uploadEvidenceBlob } from "@/lib/api";
import { compressImage, getDeviceFingerprint } from "@/lib/device";
import type { ComplaintTypeOption, IntakeContext } from "@/lib/types";

type Step = "category" | "fields" | "story" | "confirm" | "done";

type Props = {
  productId: string;
  batchId: string;
  outletId?: string | null;
  initialContext: IntakeContext | null;
  loadError: string | null;
  autoLoad?: boolean;
};

export function IntakeWizard({
  productId,
  batchId,
  outletId,
  initialContext,
  loadError,
  autoLoad = false,
}: Props) {
  const [context, setContext] = useState<IntakeContext | null>(initialContext);
  const [error, setError] = useState<string | null>(loadError);
  const [loading, setLoading] = useState(Boolean(autoLoad && !initialContext));
  const [step, setStep] = useState<Step>("category");
  const [selectedType, setSelectedType] = useState<ComplaintTypeOption | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [severity, setSeverity] = useState<number | null>(null);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [rawText, setRawText] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const progress = useMemo(() => {
    const order: Step[] = ["category", "fields", "story", "confirm", "done"];
    return ((order.indexOf(step) + 1) / order.length) * 100;
  }, [step]);

  useEffect(() => {
    if (!autoLoad || initialContext) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await resolveIntakeContext({ productId, batchId, outletId });
        if (!cancelled) setContext(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoLoad, initialContext, productId, batchId, outletId]);

  async function retryLoad() {
    setError(null);
    setLoading(true);
    try {
      const data = await resolveIntakeContext({ productId, batchId, outletId });
      setContext(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load");
    } finally {
      setLoading(false);
    }
  }

  function canContinueFromFields(): boolean {
    if (!selectedType) return false;
    for (const field of selectedType.fields) {
      if (field.is_required && !String(answers[field.id] ?? "").trim()) return false;
    }
    if (selectedType.is_safety) {
      if (!severity) return false;
      if (photoPaths.length === 0) return false;
    }
    return true;
  }

  async function onPhotoSelected(file: File) {
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const path = await uploadEvidenceBlob(compressed, "image/jpeg");
      setPhotoPaths((prev) => [...prev, path]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    if (!selectedType) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitPublicComplaint({
        product_id: productId,
        batch_id: batchId,
        outlet_id: outletId ?? null,
        template_id: selectedType.id,
        raw_text: rawText.trim(),
        field_answers: answers,
        severity_user_rated: severity,
        photo_paths: photoPaths,
        contact_phone: phone.trim() || null,
        contact_email: email.trim() || null,
        device_fingerprint: getDeviceFingerprint(),
        source: "public_qr",
      });
      setTrackingCode(result.tracking_code);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !context) {
    return (
      <div className="card-hinza space-y-4 p-6">
        <h1 className="text-2xl font-bold text-[#081636]">Link not valid</h1>
        <p className="text-sm text-gray-600">
          This QR code could not be matched to a product batch. Ask store staff for help, or try
          again.
        </p>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
        <button type="button" onClick={retryLoad} className="btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (loading || !context) {
    return (
      <div className="card-hinza flex items-center justify-center gap-3 p-8 text-sm text-gray-600">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">Hinza</p>
        <h1 className="text-2xl font-bold leading-tight text-[#081636] sm:text-3xl">
          Report an issue
        </h1>
        <p className="text-sm text-gray-600">
          {context.product.name}
          {context.batch.batch_number ? ` · Batch ${context.batch.batch_number}` : ""}
          {context.outlet ? ` · ${context.outlet.name}` : ""}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card-hinza p-5 sm:p-6">
        {step === "category" ? (
          <CategoryStep
            types={context.complaint_types}
            selectedId={selectedType?.id ?? null}
            onSelect={(type) => {
              setSelectedType(type);
              setAnswers({});
              setSeverity(null);
            }}
          />
        ) : null}

        {step === "fields" && selectedType ? (
          <FieldsStep
            complaintType={selectedType}
            answers={answers}
            severity={severity}
            photoCount={photoPaths.length}
            uploading={uploading}
            onAnswer={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
            onSeverity={setSeverity}
            onPhotoSelected={onPhotoSelected}
          />
        ) : null}

        {step === "story" ? <StoryStep value={rawText} onChange={setRawText} /> : null}

        {step === "confirm" ? (
          <ConfirmStep
            contactPhone={phone}
            contactEmail={email}
            submitting={submitting}
            error={error}
            onPhone={setPhone}
            onEmail={setEmail}
            onSubmit={onSubmit}
          />
        ) : null}

        {step === "done" && trackingCode ? (
          <div className="space-y-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Your tracking code
            </p>
            <p className="text-3xl font-bold text-[#081636]">{trackingCode}</p>
            <p className="text-sm text-gray-600">
              Save this code. You can check status anytime — no login required.
            </p>
            <Link
              href={`/t/${encodeURIComponent(trackingCode)}`}
              className="btn-primary inline-flex px-4 py-2.5"
            >
              Check status
            </Link>
          </div>
        ) : null}

        {error && step !== "confirm" && step !== "done" ? (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : null}
      </div>

      {step !== "done" && step !== "confirm" ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={step === "category"}
            onClick={() => {
              if (step === "fields") setStep("category");
              if (step === "story") setStep("fields");
            }}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-primary px-5 py-2.5"
            disabled={
              (step === "category" && !selectedType) ||
              (step === "fields" && !canContinueFromFields()) ||
              (step === "story" && rawText.trim().length < 8) ||
              uploading
            }
            onClick={() => {
              if (step === "category") setStep("fields");
              else if (step === "fields") setStep("story");
              else if (step === "story") setStep("confirm");
            }}
          >
            Continue
          </button>
        </div>
      ) : null}

      {step === "confirm" ? (
        <button type="button" className="btn-secondary" onClick={() => setStep("story")}>
          Back
        </button>
      ) : null}
    </div>
  );
}
