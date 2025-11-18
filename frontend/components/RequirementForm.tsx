"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { createRequirement, type CreateRequirementPayload } from "@/lib/api";

type RequirementFormProps = {
  onSaved: () => void;
};

const formatDate = (offset: number) => {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return now.toISOString().split("T")[0];
};

const commodityOptions = [
  { value: "black tiger shrimp", label: "Black Tiger Shrimp" },
  { value: "vannamei shrimp", label: "Vannamei Shrimp" },
  { value: "yellowfin tuna", label: "Yellowfin Tuna" },
  { value: "pangasius fillet", label: "Pangasius Fillet" },
];

const standardsList = ["EU", "US FDA", "Japan MAFF"];

type FormMessage = {
  tone: "success" | "error";
  text: string;
};

type FormState = {
  buyerName: string;
  commodity: string;
  minVolume: string;
  maxVolume: string;
  shippingStart: string;
  shippingEnd: string;
  destinationCountry: string;
  mercury: string;
  cesium: string;
  ecoli: string;
  total: string;
  standards: string[];
  notes: string;
};

const initialForm = (): FormState => ({
  buyerName: "Ocean Freight Export",
  commodity: commodityOptions[0].value,
  minVolume: "500",
  maxVolume: "1200",
  shippingStart: formatDate(7),
  shippingEnd: formatDate(28),
  destinationCountry: "JP",
  mercury: "0.4",
  cesium: "0.25",
  ecoli: "250",
  total: "1.0",
  standards: ["EU"],
  notes: "Prefer blast frozen lots with MSC paperwork mirrored.",
});

export default function RequirementForm({ onSaved }: RequirementFormProps) {
  const [formValues, setFormValues] = useState<FormState>(initialForm);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payload = useMemo<CreateRequirementPayload>(() => {
    const limitsEntries = [
      ["mercury", formValues.mercury],
      ["cesium", formValues.cesium],
      ["ecoli", formValues.ecoli],
      ["total_ppm", formValues.total],
    ] as const;
    const allowed_contaminants = limitsEntries.reduce<Record<string, number>>(
      (acc, [key, value]) => {
        if (value === "" || value === null || value === undefined) {
          return acc;
        }
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          acc[key] = parsed;
        }
        return acc;
      },
      {}
    );
    return {
      commodity: formValues.commodity,
      buyer_name: formValues.buyerName,
      min_volume: Number(formValues.minVolume),
      max_volume: Number(formValues.maxVolume),
      allowed_contaminants,
      shipping_window_start: formValues.shippingStart,
      shipping_window_end: formValues.shippingEnd,
      destination_country: formValues.destinationCountry.toUpperCase(),
      standards: formValues.standards,
      notes: formValues.notes,
    };
  }, [formValues]);

  const handleChange =
    (key: keyof FormState) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [key]: value }));
    };

  const toggleStandard = (standard: string) => () => {
    setFormValues((prev) => {
      const exists = prev.standards.includes(standard);
      return {
        ...prev,
        standards: exists
          ? prev.standards.filter((item) => item !== standard)
          : [...prev.standards, standard],
      };
    });
  };

  const resetFeedback = () => setMessage(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    if (payload.min_volume > payload.max_volume) {
      setMessage({
        tone: "error",
        text: "Minimum volume must be less than the maximum volume.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createRequirement(payload);
      setMessage({
        tone: "success",
        text: "Requirement synced to the marketplace and QC ledger.",
      });
      setFormValues(initialForm());
      onSaved();
    } catch (error) {
      setMessage({
        tone: "error",
        text: "Unable to submit requirement right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-100"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-zinc-700">
          Publish a buyer requirement with traceable QC metadata.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Buyer name
            <input
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.buyerName}
              onChange={handleChange("buyerName")}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Commodity
            <select
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.commodity}
              onChange={handleChange("commodity")}
            >
              {commodityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Destination (ISO)
            <input
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm uppercase"
              value={formValues.destinationCountry}
              onChange={handleChange("destinationCountry")}
              maxLength={3}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Minimum volume (kg)
            <input
              type="number"
              min={50}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.minVolume}
              onChange={handleChange("minVolume")}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Maximum volume (kg)
            <input
              type="number"
              min={50}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.maxVolume}
              onChange={handleChange("maxVolume")}
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Shipping window start
            <input
              type="date"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.shippingStart}
              onChange={handleChange("shippingStart")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Shipping window end
            <input
              type="date"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.shippingEnd}
              onChange={handleChange("shippingEnd")}
            />
          </label>
        </div>

        <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">
            Contaminant ceilings (ppm / cfu)
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-zinc-600 md:grid-cols-4">
            <label className="flex flex-col gap-1">
              Mercury
              <input
                type="number"
                step="0.01"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={formValues.mercury}
                onChange={handleChange("mercury")}
              />
            </label>
            <label className="flex flex-col gap-1">
              Cesium
              <input
                type="number"
                step="0.01"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={formValues.cesium}
                onChange={handleChange("cesium")}
              />
            </label>
            <label className="flex flex-col gap-1">
              E. coli (cfu)
              <input
                type="number"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={formValues.ecoli}
                onChange={handleChange("ecoli")}
              />
            </label>
            <label className="flex flex-col gap-1">
              Total PPM
              <input
                type="number"
                step="0.01"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={formValues.total}
                onChange={handleChange("total")}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="rounded-3xl border border-zinc-100 bg-zinc-50/60 p-4">
            <legend className="text-xs uppercase tracking-[0.4em] text-zinc-500">
              Standards
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {standardsList.map((standard) => {
                const checked = formValues.standards.includes(standard);
                return (
                  <label
                    key={standard}
                    className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold tracking-widest text-zinc-600"
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3 accent-emerald-600"
                      checked={checked}
                      onChange={toggleStandard(standard)}
                    />
                    {standard}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Notes for exporters
            <textarea
              className="min-h-[120px] rounded-3xl border border-zinc-200 px-3 py-2 text-sm"
              value={formValues.notes}
              onChange={handleChange("notes")}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-zinc-500">
            Requirements fuel the exporter marketplace and auto-trigger QC simulations.
          </p>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish requirement"}
          </button>
        </div>
        {message ? (
          <p
            className={`text-xs ${
              message.tone === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
