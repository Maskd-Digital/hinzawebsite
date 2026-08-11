"use client";

import type { ComplaintTypeOption } from "@/lib/types";

type Props = {
  types: ComplaintTypeOption[];
  selectedId: string | null;
  onSelect: (type: ComplaintTypeOption) => void;
};

export function CategoryStep({ types, selectedId, onSelect }: Props) {
  if (types.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No complaint templates are configured for this product yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[#081636]">What went wrong?</h2>
        <p className="text-sm text-gray-600">
          Tap what best matches what you noticed with this product.
        </p>
      </header>
      <ul className="grid gap-3">
        {types.map((type) => {
          const active = selectedId === type.id;
          return (
            <li key={type.id}>
              <button
                type="button"
                onClick={() => onSelect(type)}
                className={`w-full rounded-lg border px-4 py-4 text-left transition-colors ${
                  active
                    ? "border-[#0108B8] bg-[#EFF4FF]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
                style={
                  active
                    ? { boxShadow: "inset 0 2px 4px rgba(1, 8, 184, 0.25)" }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#081636]">{type.name}</p>
                    {type.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{type.description}</p>
                    ) : null}
                    {type.is_safety ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#FF4242]">
                        Safety priority
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                      active ? "border-[#0108B8] bg-[#0108B8]" : "border-gray-300"
                    }`}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
