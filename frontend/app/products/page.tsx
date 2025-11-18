import Link from "next/link";

const productFamilies = [
  {
    name: "Premium Shrimp Lots",
    blurb:
      "Traceable vannamei and black tiger harvests with frozen IQF formats and BRIN-cleared QC checks.",
    specs: [
      { label: "MOQ", value: "5 MT" },
      { label: "Batch size", value: "Up to 20 MT" },
      { label: "QC status", value: "BRIN verified" },
    ],
    highlight: "Designed for importers needing EU + US FDA paperwork mirrors.",
  },
  {
    name: "Wild-Caught Tuna Blocks",
    blurb:
      "Yellowfin loin and steak cuts with temperature telemetry, sashimi-grade grading, and ledger hashes.",
    specs: [
      { label: "Cut options", value: "Loin / steak / cube" },
      { label: "Ready window", value: "5-21 days" },
      { label: "Mercury guardrail", value: "< 0.4 ppm" },
    ],
    highlight: "Livetracks fishing ground, processing plant, and document prep for re-export.",
  },
  {
    name: "Value Pangasius Program",
    blurb:
      "White meat fillet program for distributors needing reliable pricing, strict antibiotics checks, and MSC-aligned paperwork.",
    specs: [
      { label: "Finish", value: "Skinless boneless" },
      { label: "Glazing", value: "4-8%" },
      { label: "Antibiotics", value: "< 0.01 ppm" },
    ],
    highlight: "Popular with wholesalers that require predictable, container-ready pallet maps.",
  },
  {
    name: "Smoked & Ready-to-Eat",
    blurb:
      "Specialty smokehouses in Java supplying ready-to-eat packs with simulated cold-chain attestations.",
    specs: [
      { label: "Formats", value: "Slices, cubes, spreads" },
      { label: "Shelf life", value: "12-18 months" },
      { label: "Batch tracking", value: "Ledger QR per pallet" },
    ],
    highlight: "Pairs with IndoXport paperwork wizard for FDA/Veterinary certificates.",
  },
];

const supplyHighlights = [
  {
    title: "Pre-export QC Simulation",
    detail:
      "Every lot is run through IndoXport's BRIN stub for LC/MS contaminant scoring, so buyers see the latest ledger hash.",
  },
  {
    title: "Documentation Atelier",
    detail:
      "COO, invoice, health certificate, and packing list templates are generated once a lot is marked catalog-eligible.",
  },
  {
    title: "Traceability Ledger",
    detail:
      "Supplier attestations, cold-chain telemetry, and QC outcomes are chained so importers can audit every hop.",
  },
];

export const metadata = {
  title: "Product Catalog | IndoXport",
  description:
    "Browse curated seafood programs that map directly into the IndoXport buyer marketplace.",
};

export default function ProductsPage() {
  return (
    <div className="bg-gradient-to-b from-white via-emerald-50/50 to-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-200/40 ring-1 ring-emerald-100">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">IndoXport product lines</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-semibold text-zinc-900">Packages that slot into importer playbooks</h1>
              <p className="text-base text-zinc-600">
                IndoXport distills Indonesian supply into themed programs. Each program carries QC rules, sample documentation,
                and shipment choreography that map straight into your ERP or trade-finance sandbox.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/marketplace"
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                View live lots
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Talk to an editor
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {productFamilies.map((family) => (
            <article
              key={family.name}
              className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-lg shadow-emerald-900/5"
            >
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.5em] text-emerald-500">Program</p>
                <h2 className="text-2xl font-semibold text-zinc-900">{family.name}</h2>
                <p className="text-sm text-zinc-600">{family.blurb}</p>
              </div>
              <dl className="mt-4 grid gap-2 text-sm text-zinc-500 sm:grid-cols-3">
                {family.specs.map((spec) => (
                  <div key={spec.label} className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3">
                    <dt className="text-[0.6rem] uppercase tracking-[0.4em] text-zinc-400">{spec.label}</dt>
                    <dd className="text-sm font-semibold text-zinc-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm font-medium text-emerald-700">{family.highlight}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
                >
                  Browse matching lots
                </Link>
                <Link
                  href="/demo"
                  className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-700 hover:bg-zinc-50"
                >
                  Inspect QC flow
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-zinc-950 p-8 text-white">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">What buyers get</p>
              <h3 className="text-2xl font-semibold">A single pane for Indonesian seafood readiness</h3>
              <p className="text-sm text-zinc-200">
                Every product family is mapped to specific BRIN QC rules, export docs, and payment choreography. IndoXport exposes that
                readiness up front so you can screen vendors before the first sample shipment.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-zinc-800/60 bg-white/5 p-4 text-sm">
              {supplyHighlights.map((highlight) => (
                <div key={highlight.title}>
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">{highlight.title}</p>
                  <p className="text-zinc-200">{highlight.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
