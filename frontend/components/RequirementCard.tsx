"use client";

import { useState } from "react";

import DocumentPreview from "@/components/DocumentPreview";
import {
  fetchMatches,
  revalidateRequirement,
  SupplierMatch,
  type BuyerRequirement,
} from "@/lib/api";

type RequirementCardProps = {
  requirement: BuyerRequirement;
  onUpdated: () => void;
};

export default function RequirementCard({
  requirement,
  onUpdated,
}: RequirementCardProps) {
  const [matches, setMatches] = useState<SupplierMatch[] | null>(null);
  const [documents, setDocuments] = useState<Record<string, string> | null>(null);
  const [qualityLabel, setQualityLabel] = useState<string | null>(
    requirement.quality_status ?? null
  );
  const [isFetchingMatches, setIsFetchingMatches] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const handleShowMatches = async () => {
    setIsFetchingMatches(true);
    try {
      const response = await fetchMatches(requirement.id);
      setMatches(response);
    } catch (error) {
      setMatches([]);
    } finally {
      setIsFetchingMatches(false);
    }
  };

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const payload = await revalidateRequirement(requirement.id);
      setDocuments(payload.documents);
      setQualityLabel(payload.quality_status);
      onUpdated();
    } catch (error) {
      // swallow for now
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <article
      data-testid="requirement-card"
      className="w-full rounded-3xl border border-zinc-100 bg-white/80 p-6 shadow-lg shadow-zinc-950/5"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {requirement.status} requirement
          </p>
          <h3 className="text-lg font-semibold text-zinc-900">
            {requirement.buyer_name}
          </h3>
          <p className="text-sm text-zinc-500">
            Sourcing {requirement.volume_required} kg of{" "}
            {requirement.product_type} between{" "}
            {requirement.shipping_window_start} and{" "}
            {requirement.shipping_window_end}
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          Contaminant ceiling: {requirement.allowed_contaminants.total_ppm} ppm
        </p>
        <p className="text-sm text-zinc-500">
          Latest ledger hash: {requirement.latest_qc_hash ?? "pending"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-zinc-200 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-400"
            onClick={handleShowMatches}
          >
            {isFetchingMatches ? "Finding matches…" : "View matches"}
          </button>
          <button
            type="button"
            className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-emerald-500 disabled:opacity-60"
            disabled={isRevalidating}
            onClick={handleRevalidate}
          >
            {isRevalidating ? "Revalidating…" : "Revalidate QC"}
          </button>
        </div>
      </div>

      {matches && matches.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4">
          <p className="text-xs uppercase tracking-widest text-emerald-700">
            Marketplace matches
          </p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-700">
            {matches.map((match) => (
              <li key={match.id} className="flex justify-between">
                <span>{match.supplier}</span>
                <span className="font-semibold text-emerald-700">
                  {match.available_volume} kg
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {documents ? (
        <section className="mt-4 grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm text-zinc-600">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {qualityLabel ?? "Quality pending"}
          </p>
          <DocumentPreview documents={documents} />
        </section>
      ) : null}
    </article>
  );
}
