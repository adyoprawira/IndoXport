"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  company?: string;
};

export default function SettingsPage() {
  // Backend base URL (change with NEXT_PUBLIC_BACKEND_URL in .env.local)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/user/`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load user");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setUser(data.user);
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

  async function handleChangePassword(e?: React.FormEvent) {
    e?.preventDefault();
    setPwMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMessage("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage("New password and confirm do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to change password");
      setPwMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwMessage(err?.message ?? String(err));
    } finally {
      setPwLoading(false);
    }
  }

  const [editMode, setEditMode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // extended details in editable form
  const [details, setDetails] = useState<any>({
    name: "",
    email: "",
    company: "",
    companyWebsite: "",
    registrationNumber: "",
    taxId: "",
    businessType: "",
    yearsInBusiness: "",
    annualVolumeTons: "",
    phone: "",
    address: "",
    warehouseAddress: "",
    region: "",
    farmLocation: "",
    certifications: {
      HACCP: false,
      ASC: false,
      BAP: false,
    },
    certificationDates: {},
    preferredPayment: "T/T",
    preferredPorts: "",
    paymentTerms: "",
    preferredIncoterm: "",
    packaging: { type: "", kgPerBox: 0 },
    notifyEmail: true,
    notifySMS: false,
    bankAccountMasked: "**** **** **** 1234",
    bankName: "",
    qcThresholds: {
      mercury: 0.5,
      antibiotics: 0.01,
    },
    qualityManager: { name: "", email: "" },
    labContact: { name: "", phone: "" },
    contactPerson: { name: "", phone: "", email: "" },
    apiKeyMasked: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setDetails((d: any) => ({
        ...d,
        name: user.name,
        email: user.email,
        company: user.company ?? "",
        companyWebsite: user.companyWebsite ?? "",
        registrationNumber: user.registrationNumber ?? "",
        taxId: user.taxId ?? "",
        businessType: user.businessType ?? "",
        yearsInBusiness: user.yearsInBusiness ?? "",
        annualVolumeTons: user.annualVolumeTons ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        warehouseAddress: user.warehouseAddress ?? "",
        region: user.region ?? "",
        farmLocation: user.farmLocation ?? "",
        contactPerson: user.contactPerson ?? d.contactPerson,
        certifications: user.certifications ?? d.certifications,
        certificationDates: user.certificationDates ?? d.certificationDates,
        preferredPayment: user.preferredPayment ?? d.preferredPayment,
        paymentTerms: user.paymentTerms ?? d.paymentTerms,
        preferredIncoterm: user.preferredIncoterm ?? d.preferredIncoterm,
        preferredPorts: user.preferredPorts ?? d.preferredPorts,
        packaging: user.packaging ?? d.packaging,
        notifyEmail: user.notifyEmail ?? d.notifyEmail,
        notifySMS: user.notifySMS ?? d.notifySMS,
        bankAccountMasked: user.bankAccountMasked ?? d.bankAccountMasked,
        bankName: user.bankName ?? d.bankName,
        qcThresholds: user.qcThresholds ?? d.qcThresholds,
        qualityManager: user.qualityManager ?? d.qualityManager,
        labContact: user.labContact ?? d.labContact,
        apiKeyMasked: user.apiKeyMasked ?? d.apiKeyMasked,
        notes: user.notes ?? d.notes,
      }));
    }
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save profile");
      setProfileMsg("Profile saved.");
      setEditMode(false);
      setUser(data.user);
    } catch (err: any) {
      setProfileMsg(err?.message ?? String(err));
    } finally {
      setProfileSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black">User Settings</h1>
        <div>
          <button
            onClick={() => setEditMode((v) => !v)}
            className="rounded-md border border-black/8 px-3 py-2 text-sm"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-600">Loading user data…</div>
      ) : error ? (
        <div className="text-sm text-red-600">Error loading user: {error}</div>
      ) : user ? (
        <form onSubmit={handleSaveProfile} className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-lg border border-black/8 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Profile</h2>
            <div className="mt-4 space-y-4 text-sm text-zinc-700">
              <div>
                <label className="text-xs text-zinc-500">Name</label>
                <div className="mt-1">
                  <input
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Email</label>
                <div className="mt-1">
                  <input value={details.email} className="w-full rounded-md border px-3 py-2" disabled />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Company</label>
                <div className="mt-1">
                  <input
                    value={details.company}
                    onChange={(e) => setDetails({ ...details, company: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Registration Number</label>
                <div className="mt-1">
                  <input
                    value={details.registrationNumber}
                    onChange={(e) => setDetails({ ...details, registrationNumber: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Phone</label>
                <div className="mt-1">
                  <input
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Address</label>
                <div className="mt-1">
                  <input
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Warehouse address</label>
                <div className="mt-1">
                  <input
                    value={details.warehouseAddress}
                    onChange={(e) => setDetails({ ...details, warehouseAddress: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Company website</label>
                <div className="mt-1">
                  <input
                    value={details.companyWebsite}
                    onChange={(e) => setDetails({ ...details, companyWebsite: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500">Tax ID</label>
                  <div className="mt-1">
                    <input
                      value={details.taxId}
                      onChange={(e) => setDetails({ ...details, taxId: e.target.value })}
                      className="w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500">Business type</label>
                  <div className="mt-1">
                    <input
                      value={details.businessType}
                      onChange={(e) => setDetails({ ...details, businessType: e.target.value })}
                      className="w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500">Years in business</label>
                  <div className="mt-1">
                    <input
                      type="number"
                      value={details.yearsInBusiness}
                      onChange={(e) => setDetails({ ...details, yearsInBusiness: e.target.value })}
                      className="w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500">Annual volume (tons)</label>
                  <div className="mt-1">
                    <input
                      type="number"
                      value={details.annualVolumeTons}
                      onChange={(e) => setDetails({ ...details, annualVolumeTons: e.target.value })}
                      className="w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs text-zinc-500">Primary contact</label>
                <div className="mt-1 grid gap-2">
                  <input
                    value={details.contactPerson.name}
                    onChange={(e) => setDetails({ ...details, contactPerson: { ...details.contactPerson, name: e.target.value } })}
                    placeholder="Name"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={details.contactPerson.phone}
                      onChange={(e) => setDetails({ ...details, contactPerson: { ...details.contactPerson, phone: e.target.value } })}
                      placeholder="Phone"
                      className="w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                    <input
                      value={details.contactPerson.email}
                      onChange={(e) => setDetails({ ...details, contactPerson: { ...details.contactPerson, email: e.target.value } })}
                      placeholder="Email"
                      className="w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-black/8 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Company & Operations</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <div>
                <label className="text-xs text-zinc-500">Region</label>
                <input
                  value={details.region}
                  onChange={(e) => setDetails({ ...details, region: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500">Farm location</label>
                <input
                  value={details.farmLocation}
                  onChange={(e) => setDetails({ ...details, farmLocation: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500">Certifications</label>
                <div className="mt-2 flex gap-3">
                  {Object.keys(details.certifications).map((k: any) => (
                    <label key={k} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={details.certifications[k]}
                        onChange={(e) => setDetails({ ...details, certifications: { ...details.certifications, [k]: e.target.checked } })}
                        disabled={!editMode}
                      />
                      <span className="text-sm">{k}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Preferred payment</label>
                <select
                  value={details.preferredPayment}
                  onChange={(e) => setDetails({ ...details, preferredPayment: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled={!editMode}
                >
                  <option>T/T</option>
                  <option>L/C</option>
                  <option>Escrow</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Preferred shipping ports (comma-separated)</label>
                <input
                  value={details.preferredPorts}
                  onChange={(e) => setDetails({ ...details, preferredPorts: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500">Payment terms</label>
                <input
                  value={details.paymentTerms}
                  onChange={(e) => setDetails({ ...details, paymentTerms: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled={!editMode}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500">Preferred Incoterm</label>
                  <input
                    value={details.preferredIncoterm}
                    onChange={(e) => setDetails({ ...details, preferredIncoterm: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500">Packaging (type)</label>
                  <input
                    value={details.packaging.type}
                    onChange={(e) => setDetails({ ...details, packaging: { ...details.packaging, type: e.target.value } })}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Packaging (kg per box)</label>
                <input
                  type="number"
                  step="1"
                  value={details.packaging.kgPerBox}
                  onChange={(e) => setDetails({ ...details, packaging: { ...details.packaging, kgPerBox: Number(e.target.value) } })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-black/8 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Notifications & Bank</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={details.notifyEmail}
                  onChange={(e) => setDetails({ ...details, notifyEmail: e.target.checked })}
                  disabled={!editMode}
                />
                <label className="text-sm">Email notifications</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={details.notifySMS}
                  onChange={(e) => setDetails({ ...details, notifySMS: e.target.checked })}
                  disabled={!editMode}
                />
                <label className="text-sm">SMS notifications</label>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Bank account (masked)</label>
                <div className="mt-1 font-medium">{details.bankAccountMasked}</div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">QC thresholds</label>
                <div className="mt-2 grid gap-2">
                  <div>
                    <div className="text-xs text-zinc-500">Mercury (mg/kg)</div>
                    <input
                      type="number"
                      step="0.01"
                      value={details.qcThresholds.mercury}
                      onChange={(e) => setDetails({ ...details, qcThresholds: { ...details.qcThresholds, mercury: parseFloat(e.target.value) } })}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Antibiotics (mg/kg)</div>
                    <input
                      type="number"
                      step="0.001"
                      value={details.qcThresholds.antibiotics}
                      onChange={(e) => setDetails({ ...details, qcThresholds: { ...details.qcThresholds, antibiotics: parseFloat(e.target.value) } })}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Bank name</label>
                <div className="mt-1 font-medium">
                  <input
                    value={details.bankName}
                    onChange={(e) => setDetails({ ...details, bankName: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs text-zinc-500">Quality manager</label>
                <div className="mt-1 grid gap-2">
                  <input
                    value={details.qualityManager.name}
                    onChange={(e) => setDetails({ ...details, qualityManager: { ...details.qualityManager, name: e.target.value } })}
                    placeholder="Name"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                  <input
                    value={details.qualityManager.email}
                    onChange={(e) => setDetails({ ...details, qualityManager: { ...details.qualityManager, email: e.target.value } })}
                    placeholder="Email"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs text-zinc-500">Lab contact</label>
                <div className="mt-1 grid gap-2">
                  <input
                    value={details.labContact.name}
                    onChange={(e) => setDetails({ ...details, labContact: { ...details.labContact, name: e.target.value } })}
                    placeholder="Organization / Name"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                  <input
                    value={details.labContact.phone}
                    onChange={(e) => setDetails({ ...details, labContact: { ...details.labContact, phone: e.target.value } })}
                    placeholder="Phone"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">API key (masked)</label>
                <div className="mt-1 font-medium">{details.apiKeyMasked}</div>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Notes</label>
                <div className="mt-1">
                  <textarea
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    rows={3}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 rounded-lg border border-black/8 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Change Password</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="text-xs text-zinc-600">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs text-zinc-600">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs text-zinc-600">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleChangePassword()}
                  className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                  disabled={pwLoading}
                >
                  {pwLoading ? "Saving…" : "Change password"}
                </button>
                {pwMessage && <div className="text-sm text-zinc-700">{pwMessage}</div>}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 flex items-center justify-between">
            <div>
              {profileMsg && <div className="text-sm text-zinc-700 mb-2">{profileMsg}</div>}
            </div>
            <div>
              {editMode && (
                <button type="submit" disabled={profileSaving} className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                  {profileSaving ? "Saving…" : "Save Profile"}
                </button>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="text-sm text-zinc-600">No user data</div>
      )}
    </div>
  );
}
