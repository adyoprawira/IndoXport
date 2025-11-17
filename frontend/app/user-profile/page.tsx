"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/profile/`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProfile(data.profile);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BACKEND_URL}/api/profile/photo/`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      // Update profile photo locally and persist via PUT
      const photoUrl = data.photoUrl;
      setProfile((p: any) => ({ ...p, photoUrl }));
      // send PUT to update profile photo persisted in stub
      await fetch(`${BACKEND_URL}/api/profile/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { photoUrl } }),
      });
    } catch (err: any) {
      alert(err?.message ?? String(err));
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Profile</h1>
        <Link href="/settings" className="rounded-md border border-black/8 px-3 py-2 text-sm">Go to Settings</Link>
      </div>

      <div className="mt-8 rounded-lg border border-black/8 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-28 w-28 overflow-hidden rounded-full bg-gray-100">
            {profile?.photoUrl ? (
              // Use plain img to avoid Next image remote config complexity
              <img src={profile.photoUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-600">{(profile?.name || "?").slice(0,1)}</div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-lg font-medium">{profile?.name}</div>
            <div className="text-sm text-zinc-600">{profile?.email}</div>
            <div className="mt-2 text-sm text-zinc-700">{profile?.phone}</div>
          </div>

          <div>
            <label className="cursor-pointer rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              {uploading ? "Uploading…" : "Change photo"}
              <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
