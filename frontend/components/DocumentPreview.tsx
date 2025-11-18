"use client";

type DocumentPreviewProps = {
  documents: Record<string, string | number | null | undefined>;
};

const formatLabel = (label: string) =>
  label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : value;
  }
  return value;
};

export default function DocumentPreview({ documents }: DocumentPreviewProps) {
  const entries = Object.entries(documents);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-2xl border border-zinc-100 bg-white/70 p-3"
        >
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-400">
            {formatLabel(key)}
          </p>
          <p className="text-sm font-semibold text-zinc-900">
            {formatValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
