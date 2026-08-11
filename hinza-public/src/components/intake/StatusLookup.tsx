"use client";

import { useState, type FormEvent } from "react";
import { getPublicStatus } from "@/lib/api";

type StatusResult = {
  tracking_code: string;
  status: string;
  created_at: string;
};

const STATUS_COPY: Record<string, string> = {
  submitted: "Received — waiting for review",
  in_review: "Under review by the product team",
  actioned: "Action has been taken",
  closed: "Closed",
};

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-yellow-100 text-[#FF9742]",
  in_review: "bg-blue-100 text-blue-700",
  actioned: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};

export function StatusLookup({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getPublicStatus(code.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">Hinza</p>
        <h1 className="text-2xl font-bold text-[#081636]">Track a complaint</h1>
        <p className="text-sm text-gray-600">
          Enter the tracking code from your confirmation. No account required.
        </p>
      </header>

      <form onSubmit={onSubmit} className="card-hinza space-y-4 p-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#081636]">Tracking code</span>
          <input
            className="input-hinza uppercase tracking-wide"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="HZ-4821"
            required
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? "Checking…" : "Check status"}
        </button>
      </form>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : null}

      {result ? (
        <div className="card-hinza space-y-3 p-5">
          <p className="text-2xl font-semibold text-[#081636]">{result.tracking_code}</p>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              STATUS_STYLE[result.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_COPY[result.status] ?? result.status}
          </span>
          <p className="text-xs text-gray-600">
            Submitted {new Date(result.created_at).toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  );
}
