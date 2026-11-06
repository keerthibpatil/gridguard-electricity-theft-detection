
"use client";

import { useEffect, useMemo, useState } from "react";

type Consumer = {
  consumer_id: number;
  consumer_name: string;
  address: string;
  phone: string;
  email: string;
  connection_type: string;
};

type ConsumerForm = {
  consumer_name: string;
  address: string;
  phone: string;
  email: string;
  connection_type: string;
};

const emptyForm: ConsumerForm = {
  consumer_name: "",
  address: "",
  phone: "",
  email: "",
  connection_type: "Residential",
};

export default function ConsumerManagement({
  canManage,
}: {
  canManage: boolean;
}) {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [form, setForm] = useState<ConsumerForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function loadConsumers() {
    try {
      const response = await fetch("/api/consumers", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load consumers.");
      }

      setConsumers(data.consumers);
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Unable to load consumers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConsumers();
  }, []);

  const filteredConsumers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return consumers.filter((consumer) =>
      [
        consumer.consumer_name,
        consumer.email,
        consumer.phone,
        consumer.address,
        consumer.connection_type,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [consumers, search]);

  function handleEdit(consumer: Consumer) {
    if (!canManage) return;

    setEditingId(consumer.consumer_id);

    setForm({
      consumer_name: consumer.consumer_name,
      address: consumer.address,
      phone: consumer.phone,
      email: consumer.email,
      connection_type: consumer.connection_type,
    });

    setMessage("");
    setError(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage) return;

    setSaving(true);
    setMessage("");
    setError(false);

    try {
      const url = editingId
        ? `/api/consumers/${editingId}`
        : "/api/consumers";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save consumer.");
      }

      setForm(emptyForm);
      setEditingId(null);

      setMessage(
        editingId
          ? "Consumer updated successfully."
          : "Consumer registered successfully."
      );

      await loadConsumers();
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Unable to save consumer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(consumer: Consumer) {
    if (!canManage) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${consumer.consumer_name}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError(false);

    try {
      const response = await fetch(
        `/api/consumers/${consumer.consumer_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete consumer.");
      }

      if (editingId === consumer.consumer_id) {
        cancelEdit();
      }

      setMessage("Consumer deleted successfully.");
      await loadConsumers();
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Unable to delete consumer."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
          GridGuard / Management
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Consumer Management
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Register, view, update and manage electricity consumers.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            {editingId ? "Edit Consumer" : "Register New Consumer"}
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Consumer Name
              </label>
              <input
                required
                maxLength={100}
                value={form.consumer_name}
                onChange={(e) =>
                  setForm({ ...form, consumer_name: e.target.value })
                }
                placeholder="Enter consumer name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                required
                type="tel"
                maxLength={20}
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                required
                type="email"
                maxLength={150}
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Enter email address"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Connection Type
              </label>
              <select
                value={form.connection_type}
                onChange={(e) =>
                  setForm({ ...form, connection_type: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Address
              </label>
              <textarea
                required
                maxLength={500}
                rows={2}
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Enter complete address"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Consumer"
                    : "Register Consumer"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Registered Consumers
            </h3>
            <p className="text-sm text-slate-500">
              {consumers.length} consumer(s) registered
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search consumers..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading consumers...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Consumer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Connection</th>
                  {canManage && (
                    <th className="px-4 py-3">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredConsumers.map((consumer) => (
                  <tr key={consumer.consumer_id}>
                    <td className="px-4 py-3 text-slate-500">
                      #{consumer.consumer_id}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-900">
                      {consumer.consumer_name}
                    </td>

                    <td className="px-4 py-3">
                      <p>{consumer.phone}</p>
                      <p className="text-xs text-slate-500">
                        {consumer.email}
                      </p>
                    </td>

                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      {consumer.address}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {consumer.connection_type}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(consumer)}
                            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(consumer)}
                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {filteredConsumers.length === 0 && (
                  <tr>
                    <td
                      colSpan={canManage ? 6 : 5}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No consumers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
