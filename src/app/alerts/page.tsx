
// import AlertManagement from "@/components/alerts/alert-management";

// export default function AlertsPage() {
//   return (
//     <main className="p-6">
//       <AlertManagement />
//     </main>
//   );
// }

import AlertManagement from "@/components/alerts/alert-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ProtectedAlertsPage() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <AlertManagement />
    </main>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading alerts...</main>}>
      <ProtectedAlertsPage />
    </Suspense>
  );
}