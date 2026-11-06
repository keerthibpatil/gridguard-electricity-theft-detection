
"use client";

import { useCallback, useEffect, useState } from "react";

type Investigation = {
  investigation_id: number;
  case_number: string;
  meter_number: string;
  consumer_name: string;
};

type Inspection = {
  inspection_id: number;
  investigation_id: number;
  case_number: string;
  meter_number: string;
  consumer_name: string;
  scheduled_date: string;
  inspection_date: string | null;
  inspection_status: string;
  findings: string | null;
  result: string | null;
};

const statuses = ["Scheduled", "In Progress", "Completed", "Cancelled"];

const results = [
  "Theft Confirmed",
  "Meter Fault",
  "No Issue",
  "Inconclusive",
];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN");
}

export default function InspectionManagement() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [investigationId, setInvestigationId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("Scheduled");
  const [editDate, setEditDate] = useState("");
  const [editFindings, setEditFindings] = useState("");
  const [editResult, setEditResult] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [inspectionResponse, investigationResponse] =
        await Promise.all([
          fetch("/api/inspections"),
          fetch("/api/investigations"),
        ]);

      const inspectionData = await inspectionResponse.json();
      const investigationData = await investigationResponse.json();

      if (!inspectionResponse.ok || !inspectionData.success) {
        throw new Error(
          inspectionData.message || "Unable to load inspections."
        );
      }

      if (!investigationResponse.ok || !investigationData.success) {
        throw new Error(
          investigationData.message || "Unable to load investigation cases."
        );
      }

      setInspections(inspectionData.inspections || []);
      setInvestigations(investigationData.investigations || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function scheduleInspection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!investigationId || !scheduledDate) {
      setError("Select an investigation and scheduled date.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investigation_id: Number(investigationId),
          scheduled_date: scheduledDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to schedule inspection.");
      }

      setMessage("Inspection scheduled successfully.");
      setInvestigationId("");
      setScheduledDate("");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to schedule inspection."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing(inspection: Inspection) {
    setEditingId(inspection.inspection_id);
    setEditStatus(inspection.inspection_status);
    setEditDate(
      inspection.inspection_date
        ? new Date(inspection.inspection_date).toISOString().slice(0, 10)
        : ""
    );
    setEditFindings(inspection.findings || "");
    setEditResult(inspection.result || "");
    setMessage("");
    setError("");
  }

  async function saveInspection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (editingId === null) return;

    if (editStatus === "Completed" && (!editDate || !editResult)) {
      setError("Completed inspections require a date and result.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/inspections/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspection_status: editStatus,
          inspection_date: editDate || null,
          findings: editFindings,
          result: editResult || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update inspection.");
      }

      setMessage("Inspection updated successfully.");
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update inspection."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteInspection(id: number) {
    if (
      !window.confirm(
        "Are you sure you want to delete this inspection?"
      )
    ) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/inspections/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete inspection.");
      }

      setMessage("Inspection deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete inspection."
      );
    }
  }

  const filteredInspections = inspections.filter((inspection) => {
    const searchText = [
      inspection.case_number,
      inspection.meter_number,
      inspection.consumer_name,
      inspection.inspection_status,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" || inspection.inspection_status === filter;

    return matchesSearch && matchesFilter;
  });

  const scheduledCount = inspections.filter(
    (i) => i.inspection_status === "Scheduled"
  ).length;

  const inProgressCount = inspections.filter(
    (i) => i.inspection_status === "In Progress"
  ).length;

  const completedCount = inspections.filter(
    (i) => i.inspection_status === "Completed"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Inspection Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Schedule physical inspections and record investigation findings.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Inspections", value: inspections.length },
          { label: "Scheduled", value: scheduledCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Completed", value: completedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={scheduleInspection}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Schedule New Inspection
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Investigation Case
            </label>
            <select
              required
              value={investigationId}
              onChange={(e) => setInvestigationId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select investigation</option>
              {investigations.map((item) => (
                <option
                  key={item.investigation_id}
                  value={item.investigation_id}
                >
                  {item.case_number} — {item.meter_number} — {item.consumer_name}
                </option>
              ))}
            </select>
            {investigations.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No investigation cases available. An anomaly must first generate a case.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Scheduled Date
            </label>
            <input
              required
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || investigations.length === 0}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Scheduling..." : "Schedule Inspection"}
        </button>
      </form>

      {editingId !== null && (
        <form
          onSubmit={saveInspection}
          className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-5"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Update Inspection
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Inspection Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Inspection Date
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Inspection Result
              </label>
              <select
                value={editResult}
                onChange={(e) => setEditResult(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select result</option>
                {results.map((result) => (
                  <option key={result} value={result}>
                    {result}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Findings
              </label>
              <textarea
                rows={3}
                value={editFindings}
                onChange={(e) => setEditFindings(e.target.value)}
                placeholder="Describe the inspection findings..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Inspection Records
          </h2>

          <button
            type="button"
            onClick={loadData}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case, meter or consumer..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading inspections...
          </p>
        ) : filteredInspections.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No inspections found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Case Number</th>
                  <th className="px-3 py-3">Meter</th>
                  <th className="px-3 py-3">Consumer</th>
                  <th className="px-3 py-3">Scheduled Date</th>
                  <th className="px-3 py-3">Inspection Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Result</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.inspection_id}>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {inspection.case_number}
                    </td>
                    <td className="px-3 py-3">{inspection.meter_number}</td>
                    <td className="px-3 py-3">{inspection.consumer_name}</td>
                    <td className="px-3 py-3">
                      {formatDate(inspection.scheduled_date)}
                    </td>
                    <td className="px-3 py-3">
                      {formatDate(inspection.inspection_date)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {inspection.inspection_status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {inspection.result || "Pending"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(inspection)}
                          className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteInspection(inspection.inspection_id)
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
