"use client";

import { FormEvent, useState } from "react";

const roles = ["Supplier", "Buyer", "Investor", "Other"];

const initialForm = {
  name: "",
  email: "",
  company: "",
  role: roles[0],
  monthlyVolume: "",
  notes: "",
};

export default function SignupPageClient() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialForm);
  };

  return (
    <div className="bg-emerald-50/40 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg shadow-emerald-200/40">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Request access</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Join the IndoXport pilot</h1>
          <p className="mt-3 text-sm text-zinc-600">
            Tell us about your role and volume. We onboard new buyers and suppliers every week and share sandbox credentials for
            the QC simulation + marketplace.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
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
              Work email
              <input
                type="email"
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
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
              Role
              <select
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-600 md:col-span-2">
              Monthly seafood volume (MT)
              <input
                type="number"
                className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={form.monthlyVolume}
                onChange={(event) => setForm((prev) => ({ ...prev, monthlyVolume: event.target.value }))}
                placeholder="100"
              />
            </label>
            <label className="text-sm font-medium text-zinc-600 md:col-span-2">
              Notes
              <textarea
                className="mt-1 w-full rounded-3xl border border-zinc-200 px-4 py-3 text-sm"
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Share buyer requirements, certifications, or fundraising timelines."
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Request invite
            </button>
            {submitted ? <p className="text-sm text-emerald-700">We received your request. Expect a reply soon.</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
