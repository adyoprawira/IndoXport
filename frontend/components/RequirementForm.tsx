"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { createRequirement } from "@/lib/api";

type RequirementFormProps = {
  onSaved: () => void;
};

const formatDate = (offset: number) => {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return now.toISOString().split("T")[0];
};

const initialForm = () => ({
  buyer_name: "Ocean Freight Export",
  product_type: "coffee",
  volume_required: 1200,
  allowed_total_ppm: 20,
  shipping_window_start: formatDate(2),
  shipping_window_end: formatDate(12),
});

export default function RequirementForm({ onSaved }: RequirementFormProps) {
  const [formValues, setFormValues] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payload = useMemo(
    () => ({
      buyer_name: formValues.buyer_name,
      product_type: formValues.product_type,
      volume_required: Number(formValues.volume_required),
      allowed_contaminants: { total_ppm: Number(formValues.allowed_total_ppm) },
      shipping_window_start: formValues.shipping_window_start,
      shipping_window_end: formValues.shipping_window_end,
    }),
    [formValues]
  );

  const handleChange =
    (key: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await createRequirement(payload);
      setMessage("Requirement submitted to the ledger-like queue.");
      setFormValues(initialForm());
      onSaved();
    } catch (error) {
      setMessage("Unable to persist requirement right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-100"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-zinc-700">
          Publish a buyer requirement to signal demand.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Buyer name
            <input
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.buyer_name}
              onChange={handleChange("buyer_name")}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Product type
            <select
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.product_type}
              onChange={handleChange("product_type")}
            >
              <option value="coffee">Coffee</option>
              <option value="cocoa">Cocoa</option>
              <option value="rubber">Rubber</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Volume (kg)
            <input
              type="number"
              min={100}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.volume_required}
              onChange={handleChange("volume_required")}
              required
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Max total contaminant (ppm)
            <input
              type="number"
              min={1}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.allowed_total_ppm}
              onChange={handleChange("allowed_total_ppm")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Shipping window start
            <input
              type="date"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.shipping_window_start}
              onChange={handleChange("shipping_window_start")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Shipping window end
            <input
              type="date"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.shipping_window_end}
              onChange={handleChange("shipping_window_end")}
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-zinc-500">
            Requirements feed the exporter marketplace matcher and trigger simulated QC.
          </p>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing…" : "Publish requirement"}
          </button>
        </div>
        {message ? (
          <p className="text-xs text-zinc-500">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
