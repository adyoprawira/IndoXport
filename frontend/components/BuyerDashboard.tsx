"use client";

import { useCallback, useEffect, useState } from "react";

import RequirementCard from "@/components/RequirementCard";
import RequirementForm from "@/components/RequirementForm";
import { BuyerRequirement, fetchRequirements } from "@/lib/api";

export default function BuyerDashboard() {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const loadRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchRequirements();
      setRequirements(payload.results);
    } catch (loadError) {
      console.warn("[IndoXport demo] Failed to refresh requirements", loadError);
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  return (
    <div className="space-y-6">
      <RequirementForm onSaved={loadRequirements} />
      <section className="space-y-4 rounded-3xl border border-zinc-100 bg-white/90 p-6 shadow-lg shadow-zinc-900/5">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Requirement board
          </p>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Matching exporters to buyer demand
          </h2>
          <p className="text-sm text-zinc-500">
            The ledger-like digest surfaces QC-approved requirements for exporters
            to explore. Tap into a requirement to inspect marketplace matches
            and the simulated QC hash trail that backs each demand signal.
          </p>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading requirements…</p>
        ) : (
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No buyer requirements yet. Use the form to publish one.
              </p>
            ) : (
              requirements.map((requirement) => (
                <RequirementCard key={requirement.id} requirement={requirement} />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
