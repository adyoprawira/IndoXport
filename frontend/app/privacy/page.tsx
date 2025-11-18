const privacyPoints = [
  {
    title: "Information we collect",
    detail: "Only the data you type into the demo forms (supplier details, requirements, messages) is stored in the local SQLite DB.",
  },
  {
    title: "How we use it",
    detail: "The data powers UI widgets so judges can see the IndoXport UX. We delete the database after each testing session.",
  },
  {
    title: "Media uploads",
    detail: "Profile photos are stored inside `/media/uploads` on the demo server. Remove them by clearing the folder.",
  },
];

export const metadata = {
  title: "Privacy | IndoXport",
};

export default function PrivacyPage() {
  return (
    <div className="bg-zinc-50 py-12">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <header className="space-y-2 rounded-3xl border border-zinc-100 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Privacy</p>
          <h1 className="text-3xl font-semibold text-zinc-900">How we treat demo data</h1>
          <p className="text-sm text-zinc-600">
            IndoXport is currently a hackathon prototype. Still, we treat your submissions with respect and delete everything on request.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
          <div className="space-y-4 text-sm text-zinc-600">
            {privacyPoints.map((point) => (
              <article key={point.title}>
                <h2 className="text-lg font-semibold text-zinc-900">{point.title}</h2>
                <p>{point.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
