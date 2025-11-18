import Image from "next/image";

import BuyerDashboard from "@/components/BuyerDashboard";

const stats = [
  { label: "Average QC turnaround", value: "12 min" },
  { label: "Ledger entries simulated", value: "1,240" },
  { label: "Ready-to-ship batches", value: "38" },
];

const matchingFlow = [
  { title: "1. Publish demand", detail: "Buyers define contaminants, volume, and shipping window." },
  { title: "2. Auto QC", detail: "Rules engine simulates lab checks and appends hashes to the ledger." },
  { title: "3. Match & document", detail: "Exporters compare requirements, revalidate QC, and receive demo docs." },
];

export default function BuyersPage() {
  return (
    <div className="bg-gradient-to-br from-zinc-50 via-white to-emerald-50 pb-16 pt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <section className="grid gap-10 rounded-3xl bg-white/90 p-8 shadow-2xl shadow-emerald-200/40 ring-1 ring-emerald-100 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Buyer cockpit</p>
            <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
              Surface clean Indonesian seafood that already passes IndoXport&apos;s simulated QC
            </h1>
            <p className="text-base text-zinc-600">
              Instead of emailing spreadsheets, the IndoXport buyer board exposes verified batches, onboarding data,
              and prefilled export documentation you can trust during demo day.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                  <p className="text-2xl font-semibold text-emerald-700">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/marketplace"
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                See exporter catalog
              </a>
              <a
                href="/demo"
                className="rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Watch QC simulation
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-100 bg-white/90 p-6">
            <Image src="/IndoXportLogo.png" alt="Buyer dashboard mock" width={512} height={320} className="w-full rounded-2xl" />
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-500">Live MVP mock</p>
            <p className="text-sm text-zinc-600">
              Exporters browse the buyer board, match batches, revalidate QC, and download invoice, COO, and health certificate samples.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl shadow-zinc-200/60 ring-1 ring-zinc-100">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Requirement board</p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Describe your demand and let IndoXport trace it through simulated QC and documentation
            </h2>
            <p className="text-base text-zinc-600">
              Every buyer post runs through the same data structure IndoXport uses for suppliers. That gives exporters a
              common language for thresholds, shipping dates, and the ledger hash that proves the QC simulation ran.
            </p>
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/60 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Workflow</p>
              <ul className="mt-3 space-y-3 text-sm text-zinc-700">
                {matchingFlow.map((step) => (
                  <li key={step.title}>
                    <span className="font-semibold text-zinc-900">{step.title}</span> - {step.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl shadow-zinc-200/60 ring-1 ring-zinc-100">
          <BuyerDashboard />
        </section>

        <section className="rounded-3xl bg-white p-8 text-zinc-900 shadow-2xl shadow-zinc-950/10 ring-1 ring-zinc-100">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Payment storyline</p>
              <h3 className="mt-2 text-2xl font-semibold text-zinc-900">Simulate T/T or L/C steps without wiring a cent</h3>
              <p className="mt-3 text-sm text-zinc-600">
                IndoXport visualizes how QC hashes, documentation, and payment checkpoints align. During the hackathon demo,
                flip between T/T and L/C to show how the ledger drives confidence before the money moves.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              {["QC revalidation recorded", "Docs assembled", "Payment status updated"].map((item, index) => (
                <div key={item}>
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">{`Step ${index + 1}`}</p>
                  <p className="text-base font-semibold text-zinc-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
