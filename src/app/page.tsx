
import { Suspense } from "react";
import DashboardStats from "@/components/dashboard-stats";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

const navigation = [
  { name: "Dashboard", icon: "▦", href: "/", active: true },
  { name: "Consumers", icon: "♙", href: "/consumers" },
  { name: "Feeders", icon: "⌁", href: "/feeders" },
  { name: "Transformers", icon: "▤", href: "/transformers" },
  { name: "Smart Meters", icon: "▣", href: "/meters" },
  { name: "Readings", icon: "↗", href: "/readings" },
  { name: "Anomalies", icon: "⚠", href: "/anomalies" },
  { name: "Alerts", icon: "♧", href: "/alerts" },
  { name: "Investigations", icon: "⌕", href: "/investigations" },
  { name: "Inspections", icon: "☷", href: "/inspections" },
  { name: "Evidence", icon: "▧", href: "/evidence" },
  { name: "Meter Events", icon: "⌁", href: "/meter-events" },
];

function LoadingDashboard() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
      <p className="text-sm text-slate-500">Loading GridGuard...</p>
    </main>
  );
}

async function ProtectedDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800 md:flex">
      <aside className="w-full bg-[#111c32] text-white md:fixed md:inset-y-0 md:flex md:w-[250px] md:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold">
            G
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">GridGuard</h1>
            <p className="text-xs text-slate-400">
              Grid Intelligence Platform
            </p>
          </div>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">
            Main Menu
          </p>

          <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  item.active
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-base">
                  {item.icon}
                </span>
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-auto hidden border-t border-white/10 p-5 md:block">
          <p className="text-sm font-medium">GridGuard System</p>
          <p className="mt-1 text-xs text-slate-400">
            Electricity monitoring and investigation
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Application online
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1 md:ml-[250px]">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              GridGuard / Overview
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Electricity grid monitoring and investigation overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500">
              Grid monitoring
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <span className="text-sm font-medium text-slate-700">
              {user.username}
            </span>

            <LogoutButton />
          </div>
        </header>

        <div className="space-y-7 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                System Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Key metrics from the electricity monitoring system.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
              Live database connection
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStats />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Grid Monitoring
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Monitoring modules and their purpose
                  </p>
                </div>
                <span className="text-xs text-slate-400">Overview</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Consumer Management",
                    "Manage electricity consumers and connection details.",
                  ],
                  [
                    "Smart Meter Monitoring",
                    "Track readings, voltage and current values.",
                  ],
                  [
                    "Anomaly Detection",
                    "Identify unusual electricity consumption patterns.",
                  ],
                  [
                    "Investigation Management",
                    "Track cases, assignments and inspection results.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                  >
                    <h4 className="text-sm font-semibold text-slate-800">
                      {title}
                    </h4>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">
                System Status
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Application components
              </p>

              <div className="mt-6 space-y-5">
                {[
                  ["Next.js Application", "Configured"],
                  ["PostgreSQL Database", "Connected"],
                  ["MongoDB Database", "Connected"],
                  ["Automatic Detection", "Implementation pending"],
                ].map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-slate-600">
                      {name}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        status === "Connected"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
            GridGuard · Electricity Theft Investigation & Grid Anomaly
            Intelligence Platform
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <ProtectedDashboard />
    </Suspense>
  );
}
