"use client";

import type { ComplaintTypeOption, IntakeField } from "@/lib/types";

type Props = {
  complaintType: ComplaintTypeOption;
  answers: Record<string, string>;
  severity: number | null;
  photoCount: number;
  uploading: boolean;
  onAnswer: (fieldId: string, value: string) => void;
  onSeverity: (value: number) => void;
  onPhotoSelected: (file: File) => void;
};

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = Array.isArray(field.options)
    ? (field.options as Array<string | { label?: string; value?: string }>)
    : field.options && typeof field.options === "object" && "choices" in (field.options as object)
      ? ((field.options as { choices: string[] }).choices ?? [])
      : [];

  if (field.field_type === "dropdown") {
    return (
      <select
        className="input-hinza"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.is_required}
      >
        <option value="">Select…</option>
        {options.map((opt, idx) => {
          const label = typeof opt === "string" ? opt : opt.label ?? opt.value ?? `Option ${idx + 1}`;
          const val = typeof opt === "string" ? opt : opt.value ?? opt.label ?? label;
          return (
            <option key={`${val}-${idx}`} value={val}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }

  if (field.field_type === "number") {
    return (
      <input
        type="number"
        className="input-hinza"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.is_required}
      />
    );
  }

  if (field.field_type === "date") {
    return (
      <input
        type="date"
        className="input-hinza"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.is_required}
      />
    );
  }

  return (
    <textarea
      className="input-hinza min-h-24"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={field.is_required}
      rows={3}
    />
  );
}

export function FieldsStep({
  complaintType,
  answers,
  severity,
  photoCount,
  uploading,
  onAnswer,
  onSeverity,
  onPhotoSelected,
}: Props) {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[#081636]">A few specifics</h2>
        <p className="text-sm text-gray-600">
          About <span className="font-medium text-[#081636]">{complaintType.name}</span>
        </p>
      </header>

      {complaintType.fields.length === 0 ? (
        <p className="text-sm text-gray-600">No extra questions for this category.</p>
      ) : (
        <div className="space-y-4">
          {complaintType.fields.map((field) => (
            <label key={field.id} className="block space-y-2">
              <span className="text-sm font-medium text-[#081636]">
                {field.field_label}
                {field.is_required ? <span className="text-red-500"> *</span> : null}
              </span>
              <FieldInput
                field={field}
                value={answers[field.id] ?? ""}
                onChange={(v) => onAnswer(field.id, v)}
              />
            </label>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-[#081636]">
          Photo evidence
          {complaintType.is_safety ? <span className="text-red-500"> *</span> : null}
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition-colors hover:bg-gray-50">
          <span className="text-sm text-[#081636]">
            {uploading
              ? "Uploading…"
              : photoCount > 0
                ? `${photoCount} photo${photoCount > 1 ? "s" : ""} attached`
                : "Take or choose a photo"}
          </span>
          <span className="text-xs text-gray-600">Camera opens directly when available</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPhotoSelected(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {complaintType.is_safety ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#081636]">
            How serious does this feel? <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onSeverity(n)}
                className={`rounded-md border py-3 text-sm font-medium transition-colors ${
                  severity === n
                    ? "border-[#FF4242] bg-red-50 text-[#FF4242]"
                    : "border-gray-300 bg-white text-[#081636] hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600">1 = minor · 5 = urgent safety concern</p>
        </div>
      ) : null}
    </div>
  );
}
