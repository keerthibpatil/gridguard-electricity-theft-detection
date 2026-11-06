
"use client";

import { useEffect, useMemo, useState } from "react";

type Consumer = {
  consumer_id: number;
  consumer_name: string;
};

type Transformer = {
  transformer_id: number;
  transformer_name: string;
};

type Meter = {
  meter_id: number;
  meter_number: string;
  consumer_id: number;
  consumer_name: string;
  transformer_id: number | null;
  transformer_name: string | null;
  meter_type: string;
  installation_date: string;
  meter_status: "Active" | "Inactive" | "Faulty" | "Removed";
};

type MeterForm = {
  meter_number: string;
  consumer_id: string;
  transformer_id: string;
  meter_type: string;
  installation_date: string;
  meter_status: "Active" | "Inactive" | "Faulty" | "Removed";
};

const emptyForm: MeterForm = {
  meter_number: "",
  consumer_id: "",
  transformer_id: "",
  meter_type: "Smart",
  installation_date: new Date().toISOString().slice(0, 10),
  meter_status: "Active",
};

export default function MeterManagement({
  canManage,
}: {
  canManage: boolean;
}) {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [form, setForm] = useState<MeterForm>(emptyForm);
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

      const [meterResponse, consumerResponse, transformerResponse] =
        await Promise.all([
          fetch("/api/meters"),
          fetch("/api/consumers"),
          fetch("/api/transformers"),
        ]);

      const [meterData, consumerData, transformerData] = await Promise.all([
        meterResponse.json(),
        consumerResponse.json(),
        transformerResponse.json(),
      ]);

      if (!meterResponse.ok || !meterData.success) {
        throw new Error(meterData.message || "Could not load meters.");
      }

      if (!consumerResponse.ok || !consumerData.success) {
        throw new Error(consumerData.message || "Could not load consumers.");
      }

      if (!transformerResponse.ok || !transformerData.success) {
        throw new Error(
          transformerData.message || "Could not load transformers."
        );
      }

      setMeters(meterData.meters);
      setConsumers(consumerData.consumers);
      setTransformers(transformerData.transformers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredMeters = useMemo(() => {
    const term = search.toLowerCase().trim();

    return meters.filter((meter) =>
      [
        meter.meter_number,
        meter.consumer_name,
        meter.transformer_name || "",
        meter.meter_type,
        meter.meter_status,
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [meters, search]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleEdit(meter: Meter) {
    if (!canManage) return;

    setEditingId(meter.meter_id);
    setForm({
      meter_number: meter.meter_number,
      consumer_id: String(meter.consumer_id),
      transformer_id: meter.transformer_id
        ? String(meter.transformer_id)
        : "",
      meter_type: meter.meter_type,
      installation_date: new Date(meter.installation_date)
        .toISOString()
        .slice(0, 10),
      meter_status: meter.meter_status,
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
        editingId ? `/api/meters/${editingId}` : "/api/meters",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            transformer_id: form.transformer_id || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save meter.");
      }

      setMessage(
        editingId
          ? "Meter updated successfully."
          : "Meter added successfully."
      );
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save meter.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(meter: Meter) {
    if (!canManage) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete meter ${meter.meter_number}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/meters/${meter.meter_id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete meter.");
      }

      if (editingId === meter.meter_id) {
        resetForm();
      }

      setMessage("Meter deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete meter.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">
          GRIDGUARD / MANAGEMENT
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Smart Meter Management
        </h1>
        <p className="mt-2 text-slate-500">
          Register meters and connect them to consumers and transformers.
        </p>
      </div>

      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            {editingId ? "Edit Smart Meter" : "Register New Smart Meter"}
          </h2>

          {consumers.length === 0 && !loading && (
            <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Add a consumer first before registering a meter.
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meter Number
              </label>
              <input
                name="meter_number"
                value={form.meter_number}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Example: GG-001"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Consumer
              </label>
              <select
                name="consumer_id"
                value={form.consumer_id}
                onChange={handleChange}
                required
                disabled={consumers.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="">Select consumer</option>
                {consumers.map((consumer) => (
                  <option key={consumer.consumer_id} value={consumer.consumer_id}>
                    {consumer.consumer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transformer (Optional)
              </label>
              <select
                name="transformer_id"
                value={form.transformer_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="">No transformer selected</option>
                {transformers.map((transformer) => (
                  <option
                    key={transformer.transformer_id}
                    value={transformer.transformer_id}
                  >
                    {transformer.transformer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meter Type
              </label>
              <select
                name="meter_type"
                value={form.meter_type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="Smart">Smart</option>
                <option value="Digital">Digital</option>
                <option value="Analog">Analog</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Installation Date
              </label>
              <input
                type="date"
                name="installation_date"
                value={form.installation_date}
                onChange={handleChange}
                required
                // max={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meter Status
              </label>
              <select
                name="meter_status"
                value={form.meter_status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Faulty">Faulty</option>
                <option value="Removed">Removed</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving || consumers.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Meter"
                    : "Register Meter"}
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
              Registered Smart Meters
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total meters: {meters.length}
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search meters..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 md:max-w-sm"
          />
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading meters...</p>
        ) : filteredMeters.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            {search ? "No matching meters found." : "No meters registered yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Meter Number</th>
                  <th className="px-6 py-4 font-semibold">Consumer</th>
                  <th className="px-6 py-4 font-semibold">Transformer</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Installation</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  {canManage && (
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeters.map((meter) => (
                  <tr key={meter.meter_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-600">
                      {meter.meter_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {meter.meter_number}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {meter.consumer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {meter.transformer_name || "Not linked"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {meter.meter_type}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(meter.installation_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {meter.meter_status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(meter)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(meter)}
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
