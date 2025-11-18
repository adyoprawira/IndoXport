"use client";

import { useState } from "react";

const API_BASE = "http://localhost:8000";

export default function RegisterPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    role: "supplier",
    identity_type: "ID_CARD",
    identity_number: "",
    npwp: "",
    email: "",
    password: "",
    full_address: "",
    phone: "",
    mother_name: "",
    domicile: "",
    birth_place: "",
    birth_date: "",
  });

  const update = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(
          typeof data === "string"
            ? data
            : data.detail || "Register failed, cek input lu."
        );
        setLoading(false);
        return;
      }

      setStatus("Register success. Coba login sekarang.");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus("Error connecting to backend.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-2">Register INDOXPORT</h1>
        <p className="text-sm text-slate-600 mb-6">
          Daftar sebagai Supplier, Buyer, atau Exporter.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="text-xs font-medium text-slate-700">
              Full Name
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              required
            />
          </div>

          <div className="col-span-1">
            <label className="text-xs font-medium text-slate-700">
              Username
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Role</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            >
              <option value="supplier">Supplier</option>
              <option value="buyer">Buyer</option>
              <option value="exporter">Exporter</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Identity Type
            </label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.identity_type}
              onChange={(e) => update("identity_type", e.target.value)}
            >
              <option value="ID_CARD">ID Card (KTP)</option>
              <option value="PASSPORT">Passport</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Identity Number
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.identity_number}
              onChange={(e) => update("identity_number", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">NPWP</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.npwp}
              onChange={(e) => update("npwp", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-700">
              Alamat Lengkap
            </label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.full_address}
              onChange={(e) => update("full_address", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Nomor Telepon
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Nama Ibu Kandung
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.mother_name}
              onChange={(e) => update("mother_name", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Domisili
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.domicile}
              onChange={(e) => update("domicile", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Tempat Lahir
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.birth_place}
              onChange={(e) => update("birth_place", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Tanggal Lahir
            </label>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.birth_date}
              onChange={(e) => update("birth_date", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex justify-between items-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <a href="/login" className="text-xs text-blue-600 underline">
              Udah punya akun? Login
            </a>
          </div>
        </form>

        {status && (
          <p className="mt-4 text-xs text-red-600 min-h-[1rem]">{status}</p>
        )}
      </div>
    </div>
  );
}
