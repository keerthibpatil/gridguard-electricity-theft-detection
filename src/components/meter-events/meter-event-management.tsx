
"use client";

import { useEffect, useState } from "react";

type Meter = {
  meter_id: number;
  meter_number: string;
};

type MeterEvent = {
  _id: string;
  meter_number: string;
  event_type: string;
  description: string;
  event_timestamp: string;
  received_at: string;
};

const eventTypes = [
  "Tampering",
  "Voltage Fluctuation",
  "Power Outage",
  "Device Diagnostic",
];

export default function MeterEventManagement() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [events, setEvents] = useState<MeterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    meter_number: "",
    event_type: "Tampering",
    description: "",
  });

  async function loadData() {
    try {
      const [eventsResponse, metersResponse] = await Promise.all([
        fetch("/api/meter-events"),
        fetch("/api/meters"),
      ]);

      const eventsData = await eventsResponse.json();
      const metersData = await metersResponse.json();

      if (!eventsResponse.ok || !eventsData.success) {
        throw new Error(eventsData.message || "Unable to load events.");
      }

      if (!metersResponse.ok || !metersData.success) {
        throw new Error(metersData.message || "Unable to load meters.");
      }

      setEvents(eventsData.events || []);
      setMeters(metersData.meters || []);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/meter-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to record event.");
      }

      setMessage(data.message);
      setForm({
        meter_number: "",
        event_type: "Tampering",
        description: "",
      });

      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  const filteredEvents = events.filter((item) =>
    [
      item.meter_number,
      item.event_type,
      item.description,
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
    return <p className="p-6 text-slate-600">Loading meter events...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Smart Meter Events
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Record and investigate flexible smart-meter telemetry events stored
          in MongoDB.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={cardStyle}>
          <p className="text-sm text-slate-500">Total Events</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {events.length}
          </p>
        </div>

        <div className={cardStyle}>
          <p className="text-sm text-slate-500">Tampering Events</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {events.filter((e) => e.event_type === "Tampering").length}
          </p>
        </div>

        <div className={cardStyle}>
          <p className="text-sm text-slate-500">Voltage Fluctuations</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {events.filter((e) => e.event_type === "Voltage Fluctuation").length}
          </p>
        </div>
      </div>

      <section className={cardStyle}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Record New Meter Event
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <label className="text-sm font-medium text-slate-700">
            Smart Meter
            <select
              className={inputStyle}
              value={form.meter_number}
              onChange={(e) =>
                setForm({ ...form, meter_number: e.target.value })
              }
              required
            >
              <option value="">Select a meter</option>
              {meters.map((meter) => (
                <option key={meter.meter_id} value={meter.meter_number}>
                  {meter.meter_number}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Event Type
            <select
              className={inputStyle}
              value={form.event_type}
              onChange={(e) =>
                setForm({ ...form, event_type: e.target.value })
              }
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Event Description
            <textarea
              className={inputStyle}
              rows={3}
              placeholder="Describe the meter event or device signal..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Record Event
            </button>
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
            MongoDB Event Records
          </h2>

          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Meter</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Event Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((item) => (
                <tr key={item._id} className="border-b border-slate-100">
                  <td className="p-3">{item.meter_number}</td>
                  <td className="p-3">{item.event_type}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3">
                    {new Date(item.event_timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No meter events found.
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
