'use client';

import { FormEvent, useEffect, useState } from 'react';

type QcRecord = {
  id: number;
  created_at: string;
  passed: boolean;
  contamination_score: number;
  details: any;
  previous_hash: string;
  record_hash: string;
};

type Batch = {
  id: number;
  batch_code: string;
  product_name: string;
  description: string;
  quantity: number;
  unit: string;
  qc_status:
    | 'not_submitted'
    | 'submitted'
    | 'brin_verifying'
    | 'brin_verified_pass'
    | 'brin_verified_fail';
  is_allowed_for_catalog: boolean;
  created_at: string;
  last_qc_at: string | null;
  brin_request_payload: any;
  brin_response_payload: any;
  latest_qc: QcRecord | null;
};

const backend =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '') ||
  'http://127.0.0.1:8000';

export default function SupplierBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    batch_code: '',
    product_name: '',
    description: '',
    quantity: 100,
    unit: 'kg',
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backend}/api/supplier/batches/`);
      if (!res.ok) {
        throw new Error(`Failed to fetch batches: ${res.status}`);
      }

      const data = await res.json();
      setBatches(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError(null);

      const res = await fetch(`${backend}/api/supplier/batches/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create batch: ${res.status} – ${text}`);
      }

      setForm({
        batch_code: '',
        product_name: '',
        description: '',
        quantity: 100,
        unit: 'kg',
      });

      await fetchBatches();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create batch');
    } finally {
      setCreating(false);
    }
  };

  const submitToBrin = async (id: number) => {
    try {
      setError(null);

      const res = await fetch(
        `${backend}/api/supplier/batches/${id}/submit-qc/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: 'Sample sent for BRIN QC (stub)',
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to submit QC: ${res.status} – ${text}`);
      }

      await fetchBatches();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit QC');
    }
  };

  const processBrin = async (id: number) => {
    try {
      setError(null);

      const res = await fetch(
        `${backend}/api/supplier/batches/${id}/process-brin/`,
        {
          method: 'POST',
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to process BRIN verification: ${res.status} – ${text}`
        );
      }

      await fetchBatches();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process BRIN verification');
    }
  };

  const renderQcStatus = (status: Batch['qc_status']) => {
    switch (status) {
      case 'not_submitted':
        return (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            Not submitted
          </span>
        );
      case 'submitted':
        return (
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            Submitted to BRIN
          </span>
        );
      case 'brin_verifying':
        return (
          <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
            BRIN verifying…
          </span>
        );
      case 'brin_verified_pass':
        return (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            BRIN verified – PASS
          </span>
        );
      case 'brin_verified_fail':
        return (
          <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
            BRIN verified – FAIL
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Supplier Dashboard – IndoXport
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Buat batch udang, kirim QC ke BRIN (stub), dan lihat mana yang
              layak masuk katalog ekspor.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Create batch form */}
        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Create New Batch
          </h2>
          <form
            onSubmit={handleCreate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                Batch Code
              </label>
              <input
                required
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={form.batch_code}
                onChange={(e) => handleChange('batch_code', e.target.value)}
                placeholder="e.g. UDANG-2025-001"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                Product Name
              </label>
              <input
                required
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={form.product_name}
                onChange={(e) =>
                  handleChange('product_name', e.target.value)
                }
                placeholder="Frozen shrimp, headless, size 50/70"
              />
            </div>

            <div className="md:col-span-2 flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={form.description}
                onChange={(e) =>
                  handleChange('description', e.target.value)
                }
                placeholder="Origin, farm, processing plant, notes…"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={form.quantity}
                onChange={(e) =>
                  handleChange('quantity', Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700">
                Unit
              </label>
              <input
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="kg / ton / carton"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create Batch'}
              </button>
            </div>
          </form>
        </section>

        {/* Batches table */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Batches
            </h2>
            <button
              onClick={fetchBatches}
              disabled={loading}
              className="text-sm text-sky-700 hover:underline disabled:opacity-60"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {batches.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada batch. Coba buat satu di atas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-3 py-2">Batch</th>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">QC Status</th>
                    <th className="px-3 py-2">Last QC</th>
                    <th className="px-3 py-2">Latest Score</th>
                    <th className="px-3 py-2">Catalog</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="px-3 py-2 align-top font-mono text-xs">
                        {b.batch_code}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-slate-900">
                          {b.product_name}
                        </div>
                        {b.description && (
                          <div className="text-xs text-slate-500">
                            {b.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {b.quantity} {b.unit}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {renderQcStatus(b.qc_status)}
                      </td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500">
                        {b.last_qc_at
                          ? new Date(b.last_qc_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {b.latest_qc ? (
                          <>
                            {b.latest_qc.contamination_score.toFixed(1)}
                            <span className="ml-1 text-slate-500">
                              / 100 (LC/MS)
                            </span>
                            <div
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${
                                b.latest_qc.passed
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {b.latest_qc.passed ? 'PASS' : 'FAIL'}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">No QC yet</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {b.is_allowed_for_catalog ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            Eligible
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                            Not eligible
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top space-x-2 text-xs">
                        {b.qc_status === 'not_submitted' && (
                          <button
                            onClick={() => submitToBrin(b.id)}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Submit QC
                          </button>
                        )}

                        {(b.qc_status === 'submitted' ||
                          b.qc_status === 'brin_verifying') && (
                          <button
                            onClick={() => processBrin(b.id)}
                            className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600"
                          >
                            Process BRIN
                          </button>
                        )}

                        {b.qc_status === 'brin_verified_fail' && (
                          <button
                            onClick={() => submitToBrin(b.id)}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Re-submit QC
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
