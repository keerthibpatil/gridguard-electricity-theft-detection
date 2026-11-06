
"use client";

import { useEffect, useMemo, useState } from "react";

type Investigation = {
  investigation_id: number;
  anomaly_id: number;
  case_number: string;
  case_status: string;
  outcome: string;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
  anomaly_type: string;
  anomaly_score: number;
  severity: string;
  meter_number: string;
  consumer_name: string;
};

export default function InvestigationManagement() {
  const [cases, setCases] = useState<Investigation[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingCase, setEditingCase] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("Open");
  const [editOutcome, setEditOutcome] = useState("Pending");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCases() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/investigations");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load investigation cases."
        );
      }

      setCases(data.investigations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load investigation cases."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  function openEditForm(item: Investigation) {
    setEditingCase(item.investigation_id);
    setEditStatus(item.case_status);
    setEditOutcome(item.outcome);
    setEditNotes(item.notes || "");
    setError("");
    setSuccess("");
  }

  async function updateCase(id: number) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/investigations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_status: editStatus,
          outcome: editOutcome,
          notes: editNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update case.");
      }

      setEditingCase(null);
      setSuccess("Investigation case updated successfully.");
      await loadCases();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update case."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch = [
        item.case_number,
        item.meter_number,
        item.consumer_name,
        item.anomaly_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || item.case_status === status;

      return matchesSearch && matchesStatus;
    });
  }, [cases, search, status]);

  const count = (value: string) =>
    cases.filter((item) => item.case_status === value).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Investigations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage cases created automatically from detected anomalies.
          </p>
        </div>

        <button
          onClick={loadCases}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Cases", value: cases.length },
          { label: "Open", value: count("Open") },
          { label: "In Progress", value: count("In Progress") },
          { label: "Closed", value: count("Closed") },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {editingCase !== null && (
        <div className="space-y-4 rounded-xl border border-blue-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Update Investigation Case
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Case Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Investigation Outcome
              </label>
              <select
                value={editOutcome}
                onChange={(e) => setEditOutcome(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed Theft">Confirmed Theft</option>
                <option value="Meter Fault">Meter Fault</option>
                <option value="No Issue Found">No Issue Found</option>
                <option value="Inconclusive">Inconclusive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Investigation Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Enter investigation findings or remarks..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateCase(editingCase)}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => setEditingCase(null)}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case, meter, consumer or anomaly..."
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Case Number</th>
              <th className="px-4 py-3">Meter</th>
              <th className="px-4 py-3">Consumer</th>
              <th className="px-4 py-3">Anomaly</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">Opened</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  Loading investigation cases...
                </td>
              </tr>
            ) : filteredCases.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  No investigation cases found.
                </td>
              </tr>
            ) : (
              filteredCases.map((item) => (
                <tr key={item.investigation_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.case_number}</td>
                  <td className="px-4 py-3">{item.meter_number}</td>
                  <td className="px-4 py-3">{item.consumer_name}</td>
                  <td className="px-4 py-3">{item.anomaly_type}</td>
                  <td className="px-4 py-3">{item.severity}</td>
                  <td className="px-4 py-3">{item.case_status}</td>
                  <td className="px-4 py-3">{item.outcome}</td>
                  <td className="px-4 py-3">
                    {new Date(item.opened_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditForm(item)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        Showing {filteredCases.length} of {cases.length} cases.
      </p>
    </div>
  );
}
