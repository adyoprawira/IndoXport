import Image from "next/image";

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

        {/* Features */}
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Traceability",
              detail: "Farm-to-shipment records with structured QC data to pinpoint contamination sources.",
            },
            {
              title: "QC Ledger",
              detail: "Hash-linked QC logs that prevent retroactive tampering and increase partner confidence.",
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
          <h3 className="text-xl font-semibold text-black">Ready to reduce export risk and scale your reach?</h3>
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
