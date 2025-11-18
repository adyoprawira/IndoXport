"use client";

import { useMemo, useState } from "react";

import DocumentPreview from "@/components/DocumentPreview";
import {
  fetchMatches,
  type BuyerRequirement,
  type MarketplaceBatch,
} from "@/lib/api";

type RequirementCardProps = {
  requirement: BuyerRequirement;
};

const formatDateRange = (start: string, end: string) => {
  if (!start || !end) return "TBD";
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
  });
  return `${formatter.format(new Date(start))} -> ${formatter.format(
    new Date(end),
  )}`;
};

const buildQualityPreview = (summary: BuyerRequirement["quality_summary"]) => {
  if (!summary) return null;
  const recorded_at = summary.created_at
    ? new Date(summary.created_at).toLocaleString()
    : null;
  return {
    status: summary.status,
    recorded_at,
    hash: summary.hash,
    previous_hash: summary.previous_hash,
    ...(summary.result ?? {}),
  };
};

const formatLabel = (label: string) =>
  label.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function RequirementCard({ requirement }: RequirementCardProps) {
  const [matches, setMatches] = useState<MarketplaceBatch[] | null>(null);
  const [isFetchingMatches, setIsFetchingMatches] = useState(false);

  const allowedLimits = useMemo(
    () =>
      Object.entries(requirement.allowed_contaminants ?? {}).filter(
        ([, value]) => value !== null && value !== undefined,
      ),
    [requirement.allowed_contaminants],
  );

  const qualityDocuments = useMemo(
    () => buildQualityPreview(requirement.quality_summary ?? null),
    [requirement.quality_summary],
  );
  const { summaryDocuments, metricsDocuments } = useMemo(() => {
    if (!qualityDocuments) {
      return { summaryDocuments: null, metricsDocuments: null };
    }
    const summaryFields = new Set(["status", "recorded_at", "hash", "previous_hash"]);
    const summary: Record<string, string | number | null | undefined> = {};
    const metrics: Record<string, string | number | null | undefined> = {};
    Object.entries(qualityDocuments).forEach(([key, value]) => {
      if (summaryFields.has(key)) {
        summary[key] = value;
      } else {
        metrics[key] = value;
      }
    });

    return {
      summaryDocuments: Object.keys(summary).length ? summary : null,
      metricsDocuments: Object.keys(metrics).length ? metrics : null,
    };
  }, [qualityDocuments]);

  const handleShowMatches = async () => {
    setIsFetchingMatches(true);
    try {
      const result = await fetchMatches(requirement.id);
      setMatches(result);
    } catch (error) {
      console.warn(
        `[IndoXport demo] Failed to fetch marketplace matches for requirement ${requirement.id}`,
        error,
      );
      setMatches([]);
    } finally {
      setIsFetchingMatches(false);
    }
  };

  return (
    <article
      data-testid="requirement-card"
      className="w-full rounded-3xl border border-zinc-100 bg-white/80 p-6 shadow-lg shadow-zinc-950/5"
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {requirement.status} requirement
          </p>
          <h3 className="text-lg font-semibold text-zinc-900">
            {requirement.buyer_name}
          </h3>
          <p className="text-sm text-zinc-500">
            {requirement.min_volume.toLocaleString()} -{" "}
            {requirement.max_volume.toLocaleString()} kg of{" "}
            <span className="font-semibold text-zinc-900">
              {requirement.commodity}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {requirement.destination_country || "ANY"}
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            Shipping window:{" "}
            {formatDateRange(
              requirement.shipping_window_start,
              requirement.shipping_window_end,
            )}
          </p>
        </div>

        {allowedLimits.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            {allowedLimits.map(([key, value]) => (
              <span
                key={key}
                className="rounded-full border border-zinc-200 px-3 py-1 uppercase tracking-[0.3em]"
              >
                {formatLabel(key)} ≤ {value}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            No contaminant limits specified.
          </p>
        )}

        {requirement.standards.length > 0 ? (
          <p className="text-xs text-zinc-500">
            Standards: {requirement.standards.join(", ")}
          </p>
        ) : null}
        {requirement.notes ? (
          <p className="text-xs italic text-zinc-500">“{requirement.notes}”</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-zinc-200 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-400"
            onClick={handleShowMatches}
          >
            {isFetchingMatches ? "Finding matches…" : "View matches"}
          </button>
        </div>
      </div>

      {matches ? (
        <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4">
          <p className="text-xs uppercase tracking-widest text-emerald-700">
            Marketplace matches
          </p>
          {matches.length === 0 ? (
            <p className="mt-2 text-xs text-emerald-800">
              No eligible batches yet. New QC-passed batches will appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm text-zinc-700">
              {matches.map((match) => (
                <li
                  key={match.batch_code}
                  className="rounded-xl border border-emerald-100 bg-white/80 p-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {match.supplier.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">
                        {match.region} {"->"} {match.destination_country}
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold text-emerald-700">
                      {match.volume_available.toLocaleString()} {match.unit}
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
                    <p>Mercury: {match.contaminant_mercury_ppm ?? "—"} ppm</p>
                    <p>Cesium: {match.contaminant_cesium_ppm ?? "—"} ppm</p>
                    <p>E. coli: {match.contaminant_ecoli_cfu ?? "—"} cfu</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {summaryDocuments ? (
        <section className="mt-4 grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm text-zinc-600">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            QC summary
          </p>
          <DocumentPreview documents={summaryDocuments} />
        </section>
      ) : qualityDocuments ? null : (
        <p className="mt-4 text-xs text-zinc-400">
          QC simulation pending for this requirement.
        </p>
      )}

      {metricsDocuments ? (
        <section className="mt-4 grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm text-zinc-600">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            QC metrics
          </p>
          <DocumentPreview documents={metricsDocuments} />
        </section>
      ) : null}
    </article>
  );
}
