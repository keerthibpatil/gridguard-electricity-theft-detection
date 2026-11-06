
"use client";

import { useEffect, useMemo, useState } from "react";

type Alert = {
  alert_id: number;
  anomaly_id: number;
  alert_message: string;
  priority: string;
  alert_status: string;
  created_at: string;
  anomaly_type: string;
  anomaly_score: number;
  meter_number: string;
  consumer_name: string;
  case_number: string | null;
};

export default function AlertManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlerts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/alerts");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load alerts.");
      }

      setAlerts(data.alerts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load alerts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = [
        alert.alert_message,
        alert.meter_number,
        alert.consumer_name,
        alert.anomaly_type,
        alert.case_number || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPriority =
        priority === "All" || alert.priority === priority;

      return matchesSearch && matchesPriority;
    });
  }, [alerts, search, priority]);

  const count = (value: string) =>
    alerts.filter((alert) => alert.priority === value).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Alerts Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Automatically generated alerts from detected grid anomalies.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Alerts", value: alerts.length },
          { label: "Critical", value: count("Critical") },
          { label: "High", value: count("High") },
          { label: "Medium", value: count("Medium") },
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

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meter, consumer, anomaly or case..."
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          <option value="All">All priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Alert ID</th>
              <th className="px-4 py-3">Meter</th>
              <th className="px-4 py-3">Consumer</th>
              <th className="px-4 py-3">Anomaly</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Investigation</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Loading alerts...
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No alerts found.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.alert_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    #{alert.alert_id}
                  </td>
                  <td className="px-4 py-3">{alert.meter_number}</td>
                  <td className="px-4 py-3">{alert.consumer_name}</td>
                  <td className="px-4 py-3">{alert.anomaly_type}</td>
                  <td className="px-4 py-3">{alert.anomaly_score}</td>
                  <td className="px-4 py-3">{alert.priority}</td>
                  <td className="px-4 py-3">{alert.alert_status}</td>
                  <td className="px-4 py-3">
                    {alert.case_number || "Not assigned"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        Showing {filteredAlerts.length} of {alerts.length} alerts.
      </p>
    </div>
  );
}
