"use client";

import { FormEvent, useState } from "react";

const topics = [
  { value: "partnership", label: "Supplier onboarding" },
  { value: "buyer", label: "Buyer access" },
  { value: "press", label: "Press / demo" },
  { value: "support", label: "Support" },
];

const offices = [
  { city: "Jakarta", detail: "Jl. Gatot Subroto No. 21\nSouth Jakarta 12930" },
  { city: "Surabaya", detail: "Jl. Perak Barat No. 3\nWarehouse D7" },
];

const initialState = {
  name: "",
  company: "",
  email: "",
  topic: topics[0].value,
  message: "",
};

export default function ContactPageClient() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    // Simulate a tiny delay to mimic network roundtrip.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setStatus("sent");
    setForm(initialState);
  };

  const disabled = status === "sending";

  return (
    <div className="bg-emerald-50/30 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg shadow-emerald-900/5">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Get in touch</p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-900">We reply within one business day</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Use the form to request sandbox credentials, share supplier data, or book a walkthrough with the IndoXport founders.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4">
              <label className="text-sm font-medium text-zinc-600">
                Full name
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium text-zinc-600">
                Company
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium text-zinc-600">
                Email
                <input
                  type="email"
                  className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium text-zinc-600">
                Topic
                <select
                  className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={form.topic}
                  onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
                >
                  {topics.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-zinc-600">
                Message
                <textarea
                  className="mt-1 w-full rounded-3xl border border-zinc-200 px-4 py-3 text-sm"
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Share what you are building or sourcing..."
                  required
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                disabled={disabled}
              >
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
              {status === "sent" ? <p className="text-sm text-emerald-700">Thanks! We will reply shortly.</p> : null}
            </div>
          </form>

          <aside className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Offices & Channels</p>
            <div className="mt-4 space-y-5 text-sm text-zinc-600">
              {offices.map((office) => (
                <div key={office.city}>
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">{office.city}</p>
                  <p className="whitespace-pre-line font-semibold text-zinc-900">{office.detail}</p>
                </div>
              ))}
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Hotline</p>
                <p className="font-semibold text-zinc-900">+62 21-777-8899</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Email</p>
                <p className="font-semibold text-zinc-900">hello@indoxport.id</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
