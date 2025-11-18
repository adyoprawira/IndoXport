const demoStages = [
  {
    title: "1. Register batch",
    content: "Enter harvest info, pond ID, and volume. Decide if the lot can advance toward export prep.",
  },
  {
    title: "2. Simulate BRIN QC",
    content: "Send data to the BRIN stub, capture the LC/MS score, and store it on the IndoXport ledger.",
  },
  {
    title: "3. Share verification",
    content: "Hand the QC hash and documents to the next team so they can plan shipping and compliance.",
  },
];

const toggles = [
  "Flip between pass or fail QC results",
  "Turn marketplace visibility on or off",
  "Regenerate invoice and COO drafts",
];

export const metadata = {
  title: "Product Demo | IndoXport",
  description: "Walk through the IndoXport experience in three interactive stages.",
};

export default function DemoPage() {
  return (
    <div className="bg-white py-12 text-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-900/5">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Live demo flow</p>
          <h1 className="mt-3 text-3xl font-semibold text-black">Walk through the QC pipeline in minutes</h1>
          <p className="mt-3 text-sm text-zinc-700">
            This page mirrors the on-site story: take one batch, run it through the BRIN simulation, and show how the ledger,
            documents, and marketplace switches react. Keep each step short and visual.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {demoStages.map((stage) => (
            <article key={stage.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">{stage.title}</p>
              <p className="mt-3 text-sm text-zinc-700">{stage.content}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-900/5">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Toggle ideas</p>
              <h2 className="mt-2 text-2xl font-semibold text-black">Adjust states while explaining the ledger</h2>
              <p className="mt-2 text-sm text-zinc-700">
                Focus on the knobs operators touch in real life. Use them to prove what gets logged, who sees the change, and
                when paperwork gets regenerated.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-zinc-700">
                {toggles.map((toggle) => (
                  <li key={toggle}>{toggle}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 shadow">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Narration script</p>
              <p className="mt-2">
                "Batch <span className="font-semibold text-black">UDANG-2025-001</span> is logged, sent to the BRIN stub, and
                receives a passing score. IndoXport stores the hash, unlocks catalog visibility, and refreshes the export
                documents so finance can pick up the hand-off."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
