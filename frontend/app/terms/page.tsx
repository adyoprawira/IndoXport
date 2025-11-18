const sections = [
  {
    title: "1. Acceptance",
    body: "By using the IndoXport demo you agree to only use the sample data for evaluation purposes during the hackathon window.",
  },
  {
    title: "2. Data",
    body: "All supplier, buyer, and QC entries are fictitious. Do not treat the BRIN simulation output as legally binding or production ready.",
  },
  {
    title: "3. Liability",
    body: "IndoXport is provided as-is. We are not liable for business decisions that stem from prototype data.",
  },
];

export const metadata = {
  title: "Terms of Service | IndoXport",
};

export default function TermsPage() {
  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <header className="space-y-3 rounded-3xl border border-zinc-100 bg-zinc-50 p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Legal</p>
          <h1 className="text-3xl font-semibold text-zinc-900">Terms of Service</h1>
          <p className="text-sm text-zinc-600">
            These terms govern the hackathon demo. IndoXport will ship formal contracts when onboarding design partners.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
          {sections.map((section) => (
            <article key={section.title} className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">{section.title}</h2>
              <p className="text-sm text-zinc-600">{section.body}</p>
            </article>
          ))}
          <p className="text-xs text-zinc-500">
            Updated {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </section>
      </div>
    </div>
  );
}
