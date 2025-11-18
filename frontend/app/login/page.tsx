"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter(); // <-- router init

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // IMPORTANT
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(
          typeof data === "string"
            ? data
            : data.detail || "Login failed, cek username/password."
        );
        setLoading(false);
        return;
      }

      // Simpan user
      setUser(data.user);
      setStatus("Login success.");

      // 🔥 Redirect after login
      router.push("/"); 
      // atau: router.push("http://localhost:3000/")

      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus("Error connecting to backend.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-2">Login INDOXPORT</h1>
        <p className="text-sm text-slate-600 mb-6">
          Masuk pakai username atau email.
        </p>

        {!user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Username / Email
              </label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex justify-between items-center mt-2">
              <a href="/register" className="text-xs text-blue-600 underline">
                Belum punya akun? Register
              </a>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">
              Welcome, <span className="font-semibold">{user.full_name}</span>
            </p>
            <p className="text-xs text-slate-600">
              Role: <b>{user.role}</b>
            </p>
          </div>
        )}

        {status && (
          <p className="mt-4 text-xs text-red-600 min-h-[1rem]">{status}</p>
        )}
      </div>
    </div>
  );
}
