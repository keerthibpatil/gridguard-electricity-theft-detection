
"use client";

import { useEffect, useState } from "react";

type Meter = {
  meter_id: number;
  meter_number: string;
  consumer_name: string;
};

type Reading = {
  reading_id: number;
  meter_id: number;
  meter_number: string;
  consumer_name: string;
  units_consumed: number;
  voltage: number;
  current_value: number;
  reading_date: string;
};

type SubmissionResult = {
  message: string;
  anomaly: {
    anomaly_id: number;
    anomaly_type: string;
    anomaly_score: number;
    severity: string;
  } | null;
};

type ReadingManagementProps = {
  canManage: boolean;
};

export default function ReadingManagement({
  canManage,
}: ReadingManagementProps) {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [meterId, setMeterId] = useState("");
  const [units, setUnits] = useState("");
  const [voltage, setVoltage] = useState("230");
  const [current, setCurrent] = useState("");
  const [readingDate, setReadingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [meterResponse, readingResponse] = await Promise.all([
        fetch("/api/meters"),
        fetch("/api/readings"),
      ]);

      const meterData = await meterResponse.json();
      const readingData = await readingResponse.json();

      if (!meterResponse.ok || !meterData.success) {
        throw new Error("Unable to load smart meters.");
      }

      if (!readingResponse.ok || !readingData.success) {
        throw new Error("Unable to load readings.");
      }

      setMeters(meterData.meters || []);
      setReadings(readingData.readings || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load data."
      );
    }
  }

  useEffect(() => {
    loadData();

    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setReadingDate(localDate);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canManage) return;

    setLoading(true);
    setMessage("");
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meter_id: meterId,
          units_consumed: units,
          voltage,
          current_value: current,
          reading_date: readingDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save reading.");
      }

      setMessage(data.message);
      setResult({
        message: data.message,
        anomaly: data.anomaly,
      });

      setUnits("");
      setVoltage("230");
      setCurrent("");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save reading."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">
          GRIDGUARD / MONITORING
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Electricity Readings
        </h1>
        <p className="mt-2 text-slate-500">
          Submit meter readings and automatically identify unusual
          electricity consumption.
        </p>
      </div>

      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Submit New Reading
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the latest reading recorded by a smart meter.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Smart Meter
                </label>
                <select
                  value={meterId}
                  onChange={(e) => setMeterId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-800"
                >
                  <option value="">Select a smart meter</option>
                  {meters.map((meter) => (
                    <option key={meter.meter_id} value={meter.meter_id}>
                      {meter.meter_number} - {meter.consumer_name}
                    </option>
                  ))}
                </select>
                {meters.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No active meters are available. Add an active meter first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reading Date and Time
                </label>
                <input
                  type="datetime-local"
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Units Consumed (kWh)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  required
                  placeholder="Example: 15"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Voltage (V)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Current (A)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  placeholder="Example: 5.5"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || meters.length === 0}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Reading"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              {message}
            </div>
          )}

          {result?.anomaly && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-5">
              <h3 className="font-semibold text-red-800">
                Anomaly Automatically Detected
              </h3>
              <div className="mt-3 space-y-2 text-sm text-red-800">
                <p>
                  <strong>Anomaly ID:</strong>{" "}
                  {result.anomaly.anomaly_id}
                </p>
                <p>
                  <strong>Type:</strong> {result.anomaly.anomaly_type}
                </p>
                <p>
                  <strong>Severity:</strong> {result.anomaly.severity}
                </p>
                <p>
                  <strong>Anomaly Score:</strong>{" "}
                  {result.anomaly.anomaly_score}/100
                </p>
                <p>
                  An alert and investigation case have been generated
                  automatically by the database triggers.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Reading History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            All submitted electricity readings.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">Reading ID</th>
                <th className="px-5 py-4">Meter</th>
                <th className="px-5 py-4">Consumer</th>
                <th className="px-5 py-4">Units (kWh)</th>
                <th className="px-5 py-4">Voltage (V)</th>
                <th className="px-5 py-4">Current (A)</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {readings.map((reading) => (
                <tr key={reading.reading_id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {reading.reading_id}
                  </td>
                  <td className="px-5 py-4">{reading.meter_number}</td>
                  <td className="px-5 py-4">{reading.consumer_name}</td>
                  <td className="px-5 py-4">
                    {Number(reading.units_consumed).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">{reading.voltage}</td>
                  <td className="px-5 py-4">{reading.current_value}</td>
                  <td className="px-5 py-4">
                    {new Date(reading.reading_date).toLocaleString()}
                  </td>
                </tr>
              ))}

              {readings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No readings have been submitted yet.
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
