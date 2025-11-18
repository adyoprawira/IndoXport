const milestones = [
  {
    year: "2022",
    title: "Piloted BRIN stub",
    detail:
      "We converted the Indonesian BRIN quality checklist into a programmable simulator so suppliers can rehearse the lab flow.",
  },
  {
    year: "2023",
    title: "Ledger prototype",
    detail:
      "Buyer and supplier attestations started flowing into an append-only chain that stores hashes for every QC record.",
  },
  {
    year: "2024",
    title: "Marketplace launch",
    detail:
      "Export-ready batches with simulated documents can be viewed by vetted buyers with contaminant filters and traceability trails.",
  },
];

const principles = [
  {
    title: "Quality first",
    statement: "We model contaminants, cold-chain telemetry, and paperwork consistency before any buyer sees a batch.",
  },
  {
    title: "Transparency",
    statement:
      "Hashes, timestamps, and document previews are exposed to both sides to keep QC conversations constructive and auditable.",
  },
  {
    title: "Human friendly",
    statement:
      "Hackathon judges and customers alike can understand what IndoXport is doing without deciphering blockchain jargon.",
  },
];

export const metadata = {
  title: "About IndoXport",
  description: "Why we are building a traceable marketplace for Indonesian seafood.",
};

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-white to-zinc-50 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4">
        <section className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Our origin</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Indonesian seafood should feel enterprise-grade</h1>
          <p className="mt-4 text-base text-zinc-600">
            IndoXport sprang from dozens of interviews with shrimp farmers and cold-chain operators. They wanted a way to prove
            their lots are compliant before wiring deposits. IndoXport stitches QC simulations, document prep, and ledgered proof
            so importers can source with confidence.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-inner shadow-zinc-100">
          <h2 className="text-2xl font-semibold text-zinc-900">Milestones</h2>
          <ol className="mt-6 border-l border-dashed border-zinc-200 pl-6">
            {milestones.map((milestone) => (
              <li key={milestone.year} className="relative mb-6 last:mb-0">
                <span className="absolute -left-3.5 top-1 h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">{milestone.year}</p>
                <h3 className="text-lg font-semibold text-zinc-900">{milestone.title}</h3>
                <p className="text-sm text-zinc-600">{milestone.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Principles</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => (
              <article key={principle.title} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600">
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">{principle.title}</p>
                <p className="mt-2 text-zinc-700">{principle.statement}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
