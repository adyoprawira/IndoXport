import Image from "next/image";

import BuyerDashboard from "@/components/BuyerDashboard";

export default function Home() {
  return (
    <div className="bg-white font-sans">
      <main className="mx-auto w-full max-w-7xl px-6 py-24 space-y-16">
        {/* Hero */}
        <section className="grid gap-10 rounded-lg bg-white p-8 shadow-sm sm:grid-cols-2 sm:items-center">
          <div>
            <Image src="/IndoXportLogo.png" alt="IndoXport logo" width={180} height={48} priority />

            <h1 className="mt-6 max-w-xl text-3xl font-extrabold leading-tight text-black sm:text-4xl">
              IndoExport — Traceability, Quality-first Exports, Marketplace
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-zinc-600">
              Menjaga kualitas udang Indonesia dari tambak sampai ke pembeli internasional. Digitalkan QC,
              simulasikan pemeriksaan pra-ekspor, dan jual hanya batch yang terverifikasi dengan bukti audit yang tidak dapat diubah.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/supplier/batches"
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900"
              >
                For Suppliers — Dashboard
              </a>

              <a
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-full border border-black/8 px-5 py-3 text-sm font-medium text-black hover:bg-black/4"
              >
                Marketplace — Verified Batches
              </a>

              <a
                href="/buyers"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                For Buyers — Search & Filter
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 sm:max-w-md">
              <div className="rounded-md bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">Simulasi</div>
                <div className="mt-1 text-sm text-zinc-600">QC engine</div>
              </div>
              <div className="rounded-md bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">Ledger</div>
                <div className="mt-1 text-sm text-zinc-600">Hash-linked QC</div>
              </div>
              <div className="rounded-md bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">Docs</div>
                <div className="mt-1 text-sm text-zinc-600">Auto templates</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-md border border-orange-100 bg-white p-6 text-left">
              <h3 className="text-lg font-semibold text-black">Demo: Pre-export QC Simulation</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Upload batch → system runs simulated tests (Cesium, Mercury, Antibiotics) → result appended to ledger.
              </p>

              <div className="mt-4 space-y-3">
                {[
                  { label: "Register Batch", detail: "Species, harvest date, volume, region" },
                  { label: "Simulated QC", detail: "Contaminant checks & pass/fail rules" },
                  { label: "Append to Ledger", detail: "Hash-linked QC history (immutable)" },
                ].map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="rounded-full bg-black p-2 text-white text-xs">{index + 1}</div>
                    <div>
                      <div className="font-medium">{step.label}</div>
                      <div className="text-sm text-zinc-600">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <a href="/demo" className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                  Try Demo
                </a>
                <a
                  href="/docs"
                  className="rounded-full border border-orange-200 px-4 py-2 text-sm font-medium text-black hover:bg-orange-50"
                >
                  Read Docs
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-lg bg-transparent">
          <h2 className="text-2xl font-semibold text-black">How it works</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">
            A simple flow that reduces contamination risk and automates export readiness.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-5">
            {[
              { icon: "📝", title: "Register", detail: "Create batch profile" },
              { icon: "🔬", title: "Pre-QC", detail: "Simulated lab checks" },
              { icon: "🔗", title: "Ledger", detail: "Immutable QC history" },
              { icon: "🛒", title: "Marketplace", detail: "List verified batches" },
              { icon: "📄", title: "Docs", detail: "Auto-generate export docs" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="text-2xl">{item.icon}</div>
                <div className="mt-2 font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-zinc-600">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Decorative shrimp */}
        <div className="pointer-events-none relative -mt-8">
          <div className="absolute left-4 top-6 hidden sm:block">
            <Image src="/shrimp.png" alt="shrimp decoration" width={48} height={48} className="h-12 w-12" />
          </div>
          <div className="absolute right-4 top-28 hidden sm:block">
            <Image src="/shrimp.png" alt="shrimp decoration" width={40} height={40} className="h-10 w-10 opacity-70" />
          </div>
        </div>

        {/* Features */}
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Traceability",
              detail: "Farm-to-shipment records with structured QC data to pinpoint contamination sources.",
            },
            {
              title: "QC Ledger",
              detail: "Hash-linked QC logs that prevent retroactive tampering and increase buyer confidence.",
            },
            {
              title: "Automation & Matchmaking",
              detail: "Auto document generation and AI-assisted matchmaking for faster, safer deals.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-lg border border-black/8 bg-white p-6 shadow-sm">
              <h4 className="font-semibold">{feature.title}</h4>
              <p className="mt-2 text-sm text-zinc-600">{feature.detail}</p>
            </div>
          ))}
        </section>

        {/* CTA bar */}
        <section className="rounded-lg bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-black">Ready to reduce export risk and reach global buyers?</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Start with a demo or register your first batch to see the QC simulation and ledger in action.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="/demo" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Try Demo
            </a>
            <a
              href="/signup"
              className="rounded-full border border-black/8 px-5 py-3 text-sm font-medium hover:bg-black/4"
            >
              Create Account
            </a>
          </div>
        </section>

        {/* Buyer experience detail */}
        <section className="space-y-4 rounded-3xl bg-white/80 p-8 shadow-xl shadow-zinc-950/5 ring-1 ring-zinc-100">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">IndoXport Buyer Flow</p>
          <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
            Match exporter demand to clean Indonesian batches faster
          </h2>
          <p className="text-lg text-zinc-600">
            The buyer experience begins with structured requirements, a simulated quality-check ledger, and a curated marketplace
            that highlights the right exporters and documentation bundles.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Structured demand",
                body: "Buyers specify contaminants, volumes, and shipping windows in one form.",
              },
              {
                title: "Immersive matching",
                body: "Exporters see which supplier batches pass the simulated QC and fit their needs.",
              },
              {
                title: "Actionable docs",
                body: "Revalidation triggers templated invoices, COOs, and health certifications for demos.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{card.title}</p>
                <p className="mt-2 text-zinc-600">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirement board + marketplace matching */}
        <section className="space-y-8 rounded-3xl bg-white/90 p-8 shadow-2xl shadow-zinc-950/5 ring-1 ring-zinc-100">
          <BuyerDashboard />
        </section>

        {/* Payment simulation callout */}
        <section className="grid gap-6 rounded-3xl border border-black/5 bg-white p-8 text-black shadow-2xl shadow-zinc-900/10 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-black">Payment simulation</p>
            <h3 className="mt-2 text-2xl font-semibold text-black">T/T and L/C inspired flows</h3>
            <p className="mt-4 max-w-lg text-sm text-black">
              Pilih jalur T/T atau L/C untuk menunjukkan bagaimana IndoXport melacak QC, dokumen, dan status pembayaran di dalam MVP.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 text-sm text-black">
            {[
              { label: "1. QC revalidation", detail: "Simulated lab pass recorded in ledger." },
              { label: "2. Commercial docs", detail: "Invoice, COO, and health certificate ready for export." },
              { label: "3. Payment status", detail: "T/T wiring or L/C confirmation surfaced for demos." },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-black">{step.label}</p>
                <p className="text-black">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
