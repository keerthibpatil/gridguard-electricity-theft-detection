
"use client";

import { useEffect, useState } from "react";

type Anomaly = {
  anomaly_id: number;
  reading_id: number | null;
  meter_id: number;
  meter_number: string;
  consumer_name: string;
  anomaly_type: string;
  anomaly_score: number;
  severity: string;
  description: string;
  detected_at: string;
  status: string;
  case_number: string | null;
  case_status: string | null;
};

export default function AnomalyManagement() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  async function loadAnomalies() {
    try {
      setError("");

      const response = await fetch("/api/anomalies");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load anomalies.");
      }

      setAnomalies(data.anomalies || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load anomalies."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnomalies();
  }, []);

  const filteredAnomalies = anomalies.filter((anomaly) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      anomaly.meter_number.toLowerCase().includes(searchText) ||
      anomaly.consumer_name.toLowerCase().includes(searchText) ||
      anomaly.anomaly_type.toLowerCase().includes(searchText) ||
      (anomaly.case_number || "").toLowerCase().includes(searchText);

    const matchesSeverity =
      severityFilter === "All" || anomaly.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  function severityStyle(severity: string) {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">
          GRIDGUARD / MONITORING
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Detected Anomalies
        </h1>
        <p className="mt-2 text-slate-500">
          Review unusual electricity readings identified automatically
          by the anomaly detection engine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Anomalies</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {anomalies.length}
          </p>
        </div>

        {["Critical", "High", "Medium"].map((severity) => (
          <div
            key={severity}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">
              {severity} Severity
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {anomalies.filter((a) => a.severity === severity).length}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Anomaly Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Anomalies generated from submitted meter readings.
            </p>
          </div>

          <button
            onClick={loadAnomalies}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meter, consumer, anomaly or case..."
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="All">All severity levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-slate-500">
            Loading anomalies...
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Meter</th>
                  <th className="px-4 py-4">Consumer</th>
                  <th className="px-4 py-4">Anomaly</th>
                  <th className="px-4 py-4">Score</th>
                  <th className="px-4 py-4">Severity</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Investigation</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAnomalies.map((anomaly) => (
                  <tr
                    key={anomaly.anomaly_id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-medium">
                      {anomaly.anomaly_id}
                    </td>
                    <td className="px-4 py-4">
                      {anomaly.meter_number}
                    </td>
                    <td className="px-4 py-4">
                      {anomaly.consumer_name}
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      {anomaly.anomaly_type}
                    </td>
                    <td className="px-4 py-4">
                      {anomaly.anomaly_score}/100
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyle(anomaly.severity)}`}
                      >
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4">{anomaly.status}</td>
                    <td className="px-4 py-4">
                      {anomaly.case_number || "Not generated"}
                      {anomaly.case_status && (
                        <p className="mt-1 text-xs text-slate-500">
                          {anomaly.case_status}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredAnomalies.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No matching anomalies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">
          Showing {filteredAnomalies.length} of {anomalies.length} anomalies.
        </p>
      </section>
    </div>
  );
}
