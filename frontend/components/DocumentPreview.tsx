"use client";

type DocumentPreviewProps = {
  documents: Record<string, string>;
};

export default function DocumentPreview({ documents }: DocumentPreviewProps) {
  return (
    <div className="space-y-2">
      {Object.entries(documents).map(([key, value]) => (
        <div key={key} className="rounded-2xl border border-zinc-100 bg-white/70 p-3">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-400">
            {key.replace(/_/g, " ")}
          </p>
          <p className="text-sm font-semibold text-zinc-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
