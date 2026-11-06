// import InspectionManagement from "@/components/inspections/inspection-management";

// export default function InspectionsPage() {
//   return (
//     <main className="p-6">
//       <InspectionManagement />
//     </main>
//   );
// }


import InspectionManagement from "@/components/inspections/inspection-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ProtectedInspectionsPage() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <InspectionManagement />
    </main>
  );
}

export default function InspectionsPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading inspections...</main>}>
      <ProtectedInspectionsPage />
    </Suspense>
  );
}