const demoStages = [
  {
    title: "1. Supplier registers batch",
    content:
      "Capture harvest metadata, upload lab notes, and toggle whether the lot should hit the marketplace once QC passes.",
  },
  {
    title: "2. BRIN QC simulation",
    content:
      "We submit to the BRIN stub, wait for the API callback, and persist the latest LC/MS score on the ledger trail.",
  },
  {
    title: "3. Buyer verification",
    content:
      "Buyers pull the batch, review contaminant ceilings, and download prefilled documentation before wiring deposits.",
  },
];

const toggles = [
  "Switch between T/T and L/C payment flows",
  "Regenerate documents with a single click",
  "Replay QC hashes to show tamper evidence",
];

export const metadata = {
  title: "Product Demo | IndoXport",
  description: "Walk through the IndoXport experience in three interactive stages.",
};

export default function DemoPage() {
  return (
    <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Live demo flow</p>
          <h1 className="mt-3 text-3xl font-semibold">Show analysts the entire QC pipeline in minutes</h1>
          <p className="mt-3 text-sm text-zinc-200">
            IndoXport&apos;s hackathon demo focuses on a single batch making its way from a supplier clipboard into the buyer
            marketplace. Every step below can be toggled to show optimistic vs. failure scenarios.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {demoStages.map((stage) => (
            <article key={stage.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">{stage.title}</p>
              <p className="mt-3 text-sm text-zinc-200">{stage.content}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Toggle ideas</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Play with states while narrating the ledger</h2>
              <p className="mt-2 text-sm text-zinc-300">
                Judges love seeing the knobs that affect exporters in real life. Use these toggles to show how IndoXport reacts.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-zinc-200">
                {toggles.map((toggle) => (
                  <li key={toggle}>{toggle}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Narration script</p>
              <p className="mt-2">
                “This supplier batch is tagged <span className="font-semibold text-white">UDANG-2025-001</span>. We send it to
                BRIN with one click, and once the LC/MS score returns under the threshold, IndoXport toggles
                <span className="font-semibold text-white"> catalog eligibility</span>. Buyers immediately see the ledger hash
                that proves the QC was run this morning.”
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
