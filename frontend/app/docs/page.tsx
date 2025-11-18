const apiEndpoints = [
  {
    method: "GET",
    path: "/api/supplier/batches/",
    notes: "List registered harvest batches along with latest QC records.",
  },
  {
    method: "POST",
    path: "/api/supplier/batches/{id}/submit-qc/",
    notes: "Submit a batch to the BRIN stub and mark it as awaiting verification.",
  },
  {
    method: "POST",
    path: "/api/supplier/batches/{id}/process-brin/",
    notes: "Trigger the QC simulation and persist the BRIN response payload.",
  },
  {
    method: "GET",
    path: "/api/buyer/marketplace/",
    notes: "Paginated marketplace endpoint with contaminant, region, and volume filters.",
  },
  {
    method: "POST",
    path: "/api/buyer/requirements/",
    notes: "Publish a buyer demand signal that will automatically run through QC simulation.",
  },
  {
    method: "GET",
    path: "/api/user/",
    notes: "Fetch demo account metadata for the settings panel.",
  },
  {
    method: "PUT",
    path: "/api/profile/",
    notes: "Update the short profile (name, phone, avatar) used across the UI.",
  },
];

const howToSections = [
  {
    title: "Authentication",
    body: "Buyer routes accept HTTP Basic auth while supplier + settings endpoints are open for hackathon use. Set NEXT_PUBLIC_BUYER_BASIC_AUTH if you want to hit protected buyer APIs directly from the browser.",
  },
  {
    title: "Running the stack",
    body: "Start Django on :8000, run `npm run dev` inside `/frontend`, and configure `NEXT_PUBLIC_BACKEND_URL` so the Next.js app knows where to fetch from.",
  },
  {
    title: "Media uploads",
    body: "Profile photo uploads land in `/media/uploads`. Django serves them during DEBUG via `MEDIA_URL`; Next simply renders the returned URL.",
  },
];

export const metadata = {
  title: "Docs | IndoXport",
  description: "Reference for the IndoXport hackathon backend endpoints.",
};

export default function DocsPage() {
  return (
    <div className="bg-white py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
        <section className="rounded-3xl border border-zinc-100 bg-zinc-50 p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">API overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Backend endpoints you can call today</h1>
          <p className="mt-3 text-sm text-zinc-600">
            Use the list below to wire demos, automations, or extra dashboards. Every endpoint ships with sensible defaults and
            hackathon-friendly authentication.
          </p>
        </section>

        <section className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.3em] text-zinc-500">
                <th className="py-2">Method</th>
                <th className="py-2">Path</th>
                <th className="py-2">Summary</th>
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((endpoint) => (
                <tr key={`${endpoint.method}-${endpoint.path}`} className="border-t border-zinc-100 text-zinc-700">
                  <td className="py-3 font-mono text-xs text-emerald-600">{endpoint.method}</td>
                  <td className="py-3 font-mono text-xs">{endpoint.path}</td>
                  <td className="py-3 text-sm">{endpoint.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">How to wire it up</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {howToSections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600">
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">{section.title}</p>
                <p className="mt-2">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Sample cURL</p>
          <pre className="mt-2 overflow-x-auto rounded-2xl bg-black px-4 py-3 font-mono text-xs text-emerald-200">
{`curl -X POST http://localhost:8000/api/buyer/requirements/ \\
  -H "Authorization: Basic $NEXT_PUBLIC_BUYER_BASIC_AUTH" \\
  -H "Content-Type: application/json" \\
  -d '{"commodity":"black tiger shrimp","min_volume":500,"max_volume":1200,"shipping_window_start":"2025-01-01","shipping_window_end":"2025-02-01"}'`}
          </pre>
        </section>
      </div>
    </div>
  );
}
