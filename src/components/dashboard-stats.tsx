"use client";

import { useEffect, useState } from "react";

type Statistics = {
  totalConsumers: number;
  activeMeters: number;
  detectedAnomalies: number;
  openInvestigations: number;
};

const cards = [
  { key: "totalConsumers", label: "Total Consumers", detail: "Registered consumers", icon: "♙" },
  { key: "activeMeters", label: "Active Meters", detail: "Monitored smart meters", icon: "▣" },
  { key: "detectedAnomalies", label: "Detected Anomalies", detail: "Requires attention", icon: "⚠" },
  { key: "openInvestigations", label: "Open Investigations", detail: "Cases under review", icon: "⌕" },
] as const;

export default function DashboardStats() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to load statistics");

        const data = await response.json();

        if (active && data.success) {
          setStats(data.statistics);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {cards.map((card) => (
        <article
          key={card.key}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
              {card.icon}
            </span>
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">
            {error ? "!" : stats ? stats[card.key] : "…"}
          </p>
          <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
        </article>
      ))}
    </>
  );
}
