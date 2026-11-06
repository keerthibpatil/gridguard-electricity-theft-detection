
"use client";

import { useEffect, useMemo, useState } from "react";

type Feeder = {
  feeder_id: number;
  feeder_name: string;
};

type Transformer = {
  transformer_id: number;
  transformer_name: string;
  feeder_id: number;
  feeder_name: string;
  location: string;
  capacity_kva: number;
  status: "Active" | "Inactive" | "Maintenance";
};

type TransformerForm = {
  transformer_name: string;
  feeder_id: string;
  location: string;
  capacity_kva: string;
  status: "Active" | "Inactive" | "Maintenance";
};

const emptyForm: TransformerForm = {
  transformer_name: "",
  feeder_id: "",
  location: "",
  capacity_kva: "",
  status: "Active",
};

export default function TransformerManagement({
  canManage,
}: {
  canManage: boolean;
}) {
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [feeders, setFeeders] = useState<Feeder[]>([]);
  const [form, setForm] = useState<TransformerForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [transformerResponse, feederResponse] = await Promise.all([
        fetch("/api/transformers"),
        fetch("/api/feeders"),
      ]);

      const transformerData = await transformerResponse.json();
      const feederData = await feederResponse.json();

      if (!transformerResponse.ok || !transformerData.success) {
        throw new Error(
          transformerData.message || "Could not load transformers."
        );
      }

      if (!feederResponse.ok || !feederData.success) {
        throw new Error(feederData.message || "Could not load feeders.");
      }

      setTransformers(transformerData.transformers);
      setFeeders(feederData.feeders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load management data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransformers = useMemo(() => {
    const term = search.toLowerCase().trim();

    return transformers.filter((transformer) =>
      [
        transformer.transformer_name,
        transformer.feeder_name,
        transformer.location,
        transformer.status,
        String(transformer.capacity_kva),
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [transformers, search]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleEdit(transformer: Transformer) {
    if (!canManage) return;

    setEditingId(transformer.transformer_id);
    setForm({
      transformer_name: transformer.transformer_name,
      feeder_id: String(transformer.feeder_id),
      location: transformer.location,
      capacity_kva: String(transformer.capacity_kva),
      status: transformer.status,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    if (!canManage) return;

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
        editingId
          ? `/api/transformers/${editingId}`
          : "/api/transformers",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            feeder_id: Number(form.feeder_id),
            capacity_kva: Number(form.capacity_kva),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save transformer.");
      }

      setMessage(
        editingId
          ? "Transformer updated successfully."
          : "Transformer added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save transformer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(transformer: Transformer) {
    if (!canManage) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${transformer.transformer_name}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/transformers/${transformer.transformer_id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete transformer.");
      }

      if (editingId === transformer.transformer_id) {
        resetForm();
      }

      setMessage("Transformer deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete transformer."
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">
          GRIDGUARD / MANAGEMENT
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Transformer Management
        </h1>
        <p className="mt-2 text-slate-500">
          Manage distribution transformers and their feeder connections.
        </p>
      </div>

      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            {editingId ? "Edit Transformer" : "Add New Transformer"}
          </h2>

          {feeders.length === 0 && !loading && (
            <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Add a feeder first before registering a transformer.
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transformer Name
              </label>
              <input
                name="transformer_name"
                value={form.transformer_name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Enter transformer name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Connected Feeder
              </label>
              <select
                name="feeder_id"
                value={form.feeder_id}
                onChange={handleChange}
                required
                disabled={feeders.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a feeder</option>
                {feeders.map((feeder) => (
                  <option key={feeder.feeder_id} value={feeder.feeder_id}>
                    {feeder.feeder_name}
                  </option>
                ))}
              </select>
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
                Capacity (kVA)
              </label>
              <input
                name="capacity_kva"
                type="number"
                min="0.01"
                step="0.01"
                value={form.capacity_kva}
                onChange={handleChange}
                required
                placeholder="Enter capacity in kVA"
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
                disabled={saving || feeders.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Transformer"
                    : "Add Transformer"}
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

      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Registered Transformers
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total transformers: {transformers.length}
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transformers..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 md:max-w-sm"
          />
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">
            Loading transformers...
          </p>
        ) : filteredTransformers.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            {search
              ? "No matching transformers found."
              : "No transformers added yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Transformer</th>
                  <th className="px-6 py-4 font-semibold">Feeder</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Capacity</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  {canManage && (
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransformers.map((transformer) => (
                  <tr
                    key={transformer.transformer_id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-slate-600">
                      {transformer.transformer_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {transformer.transformer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transformer.feeder_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transformer.location}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transformer.capacity_kva} kVA
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {transformer.status}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(transformer)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transformer)}
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
