
"use client";

import { useEffect, useMemo, useState } from "react";

type Feeder = {
  feeder_id: number;
  feeder_name: string;
  location: string;
  capacity_kw: number;
  status: "Active" | "Inactive" | "Maintenance";
  created_at: string;
};

type FeederForm = {
  feeder_name: string;
  location: string;
  capacity_kw: string;
  status: "Active" | "Inactive" | "Maintenance";
};

const emptyForm: FeederForm = {
  feeder_name: "",
  location: "",
  capacity_kw: "",
  status: "Active",
};

export default function FeederManagement({
  canManage,
}: {
  canManage: boolean;
}) {
  const [feeders, setFeeders] = useState<Feeder[]>([]);
  const [form, setForm] = useState<FeederForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadFeeders() {
    try {
      setLoading(true);
      const response = await fetch("/api/feeders");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load feeders.");
      }

      setFeeders(data.feeders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load feeders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeeders();
  }, []);

  const filteredFeeders = useMemo(() => {
    const term = search.toLowerCase().trim();

    return feeders.filter((feeder) =>
      [
        feeder.feeder_name,
        feeder.location,
        feeder.status,
        String(feeder.capacity_kw),
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [feeders, search]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleEdit(feeder: Feeder) {
    if (!canManage) return;

    setEditingId(feeder.feeder_id);
    setForm({
      feeder_name: feeder.feeder_name,
      location: feeder.location,
      capacity_kw: String(feeder.capacity_kw),
      status: feeder.status,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editingId ? `/api/feeders/${editingId}` : "/api/feeders",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            capacity_kw: Number(form.capacity_kw),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save feeder.");
      }

      setMessage(
        editingId
          ? "Feeder updated successfully."
          : "Feeder added successfully."
      );
      setForm(emptyForm);
      setEditingId(null);
      await loadFeeders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save feeder.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(feeder: Feeder) {
    if (!canManage) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${feeder.feeder_name}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/feeders/${feeder.feeder_id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete feeder.");
      }

      if (editingId === feeder.feeder_id) {
        resetForm();
      }

      setMessage("Feeder deleted successfully.");
      await loadFeeders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete feeder.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">
          GRIDGUARD / MANAGEMENT
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Feeder Management
        </h1>
        <p className="mt-2 text-slate-500">
          Manage electricity distribution feeders and their capacity.
        </p>
      </div>

      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            {editingId ? "Edit Feeder" : "Add New Feeder"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Feeder Name
              </label>
              <input
                name="feeder_name"
                value={form.feeder_name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Enter feeder name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="Enter location"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Capacity (kW)
              </label>
              <input
                name="capacity_kw"
                type="number"
                min="0.01"
                step="0.01"
                value={form.capacity_kw}
                onChange={handleChange}
                required
                placeholder="Enter capacity in kW"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Feeder"
                    : "Add Feeder"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {(message || error) && (
        <div
          className={`rounded-lg p-3 text-sm ${
            error
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Registered Feeders
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total feeders: {feeders.length}
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feeders..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 md:max-w-sm"
          />
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading feeders...</p>
        ) : filteredFeeders.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            {search ? "No matching feeders found." : "No feeders added yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Feeder Name</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Capacity</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  {canManage && (
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredFeeders.map((feeder) => (
                  <tr key={feeder.feeder_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-600">
                      {feeder.feeder_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {feeder.feeder_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {feeder.location}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {feeder.capacity_kw} kW
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {feeder.status}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(feeder)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(feeder)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
