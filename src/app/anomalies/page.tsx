
// // import AnomalyManagement from "@/components/anomalies/anomaly-management";

// // export default function AnomaliesPage() {
// //   return (
// //     <main className="min-h-screen bg-slate-50 p-6 md:p-10">
// //       <AnomalyManagement />
// //     </main>
// //   );
// // }


// import AnomalyManagement from "@/components/anomalies/anomaly-management";
// import { getCurrentUser } from "@/lib/auth";
// import { redirect } from "next/navigation";

// export default async function AnomaliesPage() {
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login");
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 p-6 md:p-10">
//       <AnomalyManagement />
//     </main>
//   );
// }


import AnomalyManagement from "@/components/anomalies/anomaly-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ProtectedAnomaliesPage() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <AnomalyManagement />
    </main>
  );
}

export default function AnomaliesPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading anomalies...</main>}>
      <ProtectedAnomaliesPage />
    </Suspense>
  );
}