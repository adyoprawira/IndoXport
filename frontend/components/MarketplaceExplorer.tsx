"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import DocumentPreview from "@/components/DocumentPreview";
import {
  fetchMarketplace,
  type MarketplaceBatch,
  type MarketplaceFilters,
} from "@/lib/api";

const defaultFormFilters = {
  region: "",
  destination: "",
  countryOfOrigin: "",
  minVolume: "",
  maxVolume: "",
  maxMercury: "",
  ordering: "-harvest_date",
};

const defaultAppliedFilters: MarketplaceFilters = {
  ordering: "-harvest_date",
  page_size: 12,
};

const orderingOptions = [
  { value: "-harvest_date", label: "Newest harvest" },
  { value: "harvest_date", label: "Oldest harvest" },
  { value: "price", label: "Lowest price" },
  { value: "-price", label: "Highest price" },
  { value: "mercury", label: "Lowest mercury" },
];

export default function MarketplaceExplorer() {
  const [formFilters, setFormFilters] = useState(defaultFormFilters);
  const [appliedFilters, setAppliedFilters] = useState<MarketplaceFilters>(
    defaultAppliedFilters,
  );
  const [batches, setBatches] = useState<MarketplaceBatch[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadMarketplace = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchMarketplace(appliedFilters);
      setBatches(response.results);
      setCount(response.count ?? response.results.length);
    } catch (err) {
      console.warn("[IndoXport demo] Failed to load marketplace", err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadMarketplace();
  }, [loadMarketplace]);

  const handleChange =
    (key: keyof typeof formFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormFilters((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const buildFilters = useCallback((): MarketplaceFilters => {
    const next: MarketplaceFilters = {
      ordering: formFilters.ordering,
      region: formFilters.region || undefined,
      destination_country: formFilters.destination || undefined,
      country_of_origin: formFilters.countryOfOrigin || undefined,
      min_volume: formFilters.minVolume
        ? Number(formFilters.minVolume)
        : undefined,
      max_volume: formFilters.maxVolume
        ? Number(formFilters.maxVolume)
        : undefined,
      max_mercury: formFilters.maxMercury
        ? Number(formFilters.maxMercury)
        : undefined,
      page_size: 12,
    };
    return next;
  }, [formFilters]);

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters(buildFilters());
  };

  const handleResetFilters = () => {
    setFormFilters(defaultFormFilters);
    setAppliedFilters(defaultAppliedFilters);
  };

  const filtersSummary = useMemo(() => {
    const summaryParts = [];
    if (formFilters.region) summaryParts.push(`Region: ${formFilters.region}`);
    if (formFilters.destination)
      summaryParts.push(`Destination: ${formFilters.destination}`);
    if (formFilters.maxMercury)
      summaryParts.push(`≤ ${formFilters.maxMercury} ppm Mercury`);
    return summaryParts.join(" · ");
  }, [formFilters.region, formFilters.destination, formFilters.maxMercury]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <header className="rounded-3xl bg-white/90 p-8 shadow-2xl shadow-emerald-200/50 ring-1 ring-emerald-100">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">
          Buyer marketplace
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
          QC-cleared Indonesian seafood that&apos;s export-ready
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          The listing below mirrors what exporters see after BRIN-style verification.
          Filter by region, contaminant ceilings, and ordering to build a short-list
          for each buyer requirement.
        </p>
        <p className="mt-4 text-sm font-semibold text-emerald-800">
          {loading ? "Loading inventory…" : `${count} batches available`}
        </p>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-100">
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          onSubmit={handleApplyFilters}
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Region
            <input
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formFilters.region}
              onChange={handleChange("region")}
              placeholder="Sulawesi, Bali, ..."
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Destination (ISO)
            <input
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm uppercase"
              value={formFilters.destination}
              onChange={handleChange("destination")}
              maxLength={3}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Country of origin
            <input
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formFilters.countryOfOrigin}
              onChange={handleChange("countryOfOrigin")}
              placeholder="ID, VN, ..."
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Min volume (kg)
            <input
              type="number"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formFilters.minVolume}
              onChange={handleChange("minVolume")}
              min={0}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Max volume (kg)
            <input
              type="number"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formFilters.maxVolume}
              onChange={handleChange("maxVolume")}
              min={0}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Max mercury (ppm)
            <input
              type="number"
              step="0.01"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formFilters.maxMercury}
              onChange={handleChange("maxMercury")}
              min={0}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Ordering
            <select
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formFilters.ordering}
              onChange={handleChange("ordering")}
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
                disabled={loading}
              >
                Apply filters
              </button>
              <button
                type="button"
                className="rounded-full border border-zinc-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-zinc-600 hover:border-zinc-400"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>
            {filtersSummary ? (
              <p className="text-xs text-zinc-500">{filtersSummary}</p>
            ) : (
              <p className="text-xs text-zinc-400">
                Showing all QC-cleared batches.
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {batches.map((batch) => (
          <BatchCard key={batch.batch_code} batch={batch} />
        ))}
        {!loading && batches.length === 0 ? (
          <p className="col-span-full rounded-3xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
            No batches match your filters yet. Try broadening the range.
          </p>
        ) : null}
      </section>
    </div>
  );
}

type BatchCardProps = {
  batch: MarketplaceBatch;
};

function BatchCard({ batch }: BatchCardProps) {
  const sizeRange =
    batch.size_range.min_mm || batch.size_range.max_mm
      ? `${batch.size_range.min_mm ?? "?"} - ${
          batch.size_range.max_mm ?? "?"
        } mm`
      : "Flexible size";

  const qualitySummary = batch.quality_summary
    ? {
        status: batch.quality_summary.status,
        contamination_score: batch.quality_summary.result?.contamination_score,
        record_hash: batch.quality_summary.hash,
        created_at: batch.quality_summary.created_at
          ? new Date(batch.quality_summary.created_at).toLocaleString()
          : undefined,
      }
    : null;

  return (
    <article className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-100">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">
          {batch.species}
        </p>
        <h3 className="text-xl font-semibold text-zinc-900">
          {batch.supplier.name}
        </h3>
        <p className="text-sm text-zinc-500">
          {batch.region} · Origin {batch.country_of_origin.toUpperCase()} ·
          Ready by {batch.ready_date ?? "TBD"}
        </p>
        <p className="text-sm text-zinc-500">
          Capacity:{" "}
          <span className="font-semibold text-zinc-900">
            {batch.volume_available.toLocaleString()} {batch.unit}
          </span>{" "}
          · Size {sizeRange}
        </p>
        <p className="text-sm font-semibold text-emerald-700">
          {batch.price_per_unit
            ? `IDR ${Number(batch.price_per_unit).toLocaleString()} / ${
                batch.unit
              }`
            : "Price shared on request"}
        </p>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
        <p>Dest: {batch.destination_country || "Any"}</p>
        <p>Mercury: {batch.contaminant_mercury_ppm ?? "—"} ppm</p>
        <p>Cesium: {batch.contaminant_cesium_ppm ?? "—"} ppm</p>
      </div>

      {qualitySummary ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">
            Latest QC ledger entry
          </p>
          <DocumentPreview documents={qualitySummary} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-zinc-400">
          QC record pending for this batch.
        </p>
      )}
    </article>
  );
}
