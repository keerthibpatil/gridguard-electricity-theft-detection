"use client";

import { useEffect, useState } from "react";

type Inspection = {
  inspection_id: number;
  case_number: string;
  meter_number: string;
  consumer_name: string;
  inspection_status: string;
};

type Evidence = {
  evidence_id: number;
  inspection_id: number;
  evidence_type: string;
  file_path: string;
  description: string | null;
  collected_at: string;
  case_number: string;
  meter_number: string;
  consumer_name: string;
};

export default function EvidenceManagement() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    inspection_id: "",
    evidence_type: "Photograph",
    file_path: "",
    description: "",
  });

  async function loadData() {
    try {
      const [evidenceResponse, inspectionResponse] = await Promise.all([
        fetch("/api/evidence"),
        fetch("/api/inspections"),
      ]);

      const evidenceData = await evidenceResponse.json();
      const inspectionData = await inspectionResponse.json();

      if (!evidenceResponse.ok || !evidenceData.success) {
        throw new Error(evidenceData.message || "Unable to load evidence.");
      }

      if (!inspectionResponse.ok || !inspectionData.success) {
        throw new Error(inspectionData.message || "Unable to load inspections.");
      }

      setEvidence(evidenceData.evidence || []);
      setInspections(inspectionData.inspections || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm({
      inspection_id: "",
      evidence_type: "Photograph",
      file_path: "",
      description: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const url = editingId
        ? `/api/evidence/${editingId}`
        : "/api/evidence";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          inspection_id: Number(form.inspection_id),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save evidence.");
      }

      setMessage(data.message);
      resetForm();
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  function startEditing(item: Evidence) {
    setEditingId(item.evidence_id);
    setForm({
      inspection_id: String(item.inspection_id),
      evidence_type: item.evidence_type,
      file_path: item.file_path,
      description: item.description || "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteEvidence(id: number) {
    if (!window.confirm("Are you sure you want to delete this evidence record?")) {
      return;
    }

    try {
      const response = await fetch(`/api/evidence/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete evidence.");
      }

      setMessage(data.message);
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete evidence."
      );
    }
  }

  const filteredEvidence = evidence.filter((item) =>
    [
      item.evidence_type,
      item.file_path,
      item.case_number,
      item.meter_number,
      item.consumer_name,
      item.description || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const cardStyle =
    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
  const inputStyle =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500";

  if (loading) {
    return <p className="p-6 text-slate-600">Loading evidence records...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Evidence Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Maintain evidence records linked to field inspections.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={cardStyle}>
          <p className="text-sm text-slate-500">Total Evidence</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {evidence.length}
          </p>
        </div>

        <div className={cardStyle}>
          <p className="text-sm text-slate-500">Photographs</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {evidence.filter((item) => item.evidence_type === "Photograph").length}
          </p>
        </div>

        <div className={cardStyle}>
          <p className="text-sm text-slate-500">Documents</p>
          <p className="mt-2 text-3xl font-bold text-indigo-700">
            {evidence.filter((item) => item.evidence_type === "Document").length}
          </p>
        </div>
      </div>

      <section className={cardStyle}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {editingId ? "Update Evidence" : "Add Evidence"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Inspection
            <select
              className={inputStyle}
              value={form.inspection_id}
              onChange={(event) =>
                setForm({ ...form, inspection_id: event.target.value })
              }
              required
            >
              <option value="">Select an inspection</option>
              {inspections.map((inspection) => (
                <option
                  key={inspection.inspection_id}
                  value={inspection.inspection_id}
                >
                  {inspection.case_number} — {inspection.meter_number} (
                  {inspection.consumer_name})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Evidence Type
            <select
              className={inputStyle}
              value={form.evidence_type}
              onChange={(event) =>
                setForm({ ...form, evidence_type: event.target.value })
              }
            >
              <option value="Photograph">Photograph</option>
              <option value="Document">Document</option>
              <option value="Video">Video</option>
              <option value="Meter Report">Meter Report</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            File Path or Reference
            <input
              className={inputStyle}
              value={form.file_path}
              onChange={(event) =>
                setForm({ ...form, file_path: event.target.value })
              }
              placeholder="Example: evidence/meter-photo-001.jpg"
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Description
            <textarea
              className={inputStyle}
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Describe what this evidence shows..."
            />
          </label>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {editingId ? "Update Evidence" : "Add Evidence"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </section>

      <section className={cardStyle}>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Evidence Records
          </h2>

          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="Search evidence..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Case</th>
                <th className="p-3">Meter</th>
                <th className="p-3">Consumer</th>
                <th className="p-3">Type</th>
                <th className="p-3">File Reference</th>
                <th className="p-3">Description</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvidence.map((item) => (
                <tr key={item.evidence_id} className="border-b border-slate-100">
                  <td className="p-3">{item.evidence_id}</td>
                  <td className="p-3">{item.case_number}</td>
                  <td className="p-3">{item.meter_number}</td>
                  <td className="p-3">{item.consumer_name}</td>
                  <td className="p-3">{item.evidence_type}</td>
                  <td className="max-w-48 break-all p-3">{item.file_path}</td>
                  <td className="max-w-48 p-3">{item.description || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(item)}
                        className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEvidence(item.evidence_id)}
                        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEvidence.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No evidence records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}