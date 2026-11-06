// import EvidenceManagement from "@/components/evidence/evidence-management";

// export default function EvidencePage() {
//   return (
//     <main className="p-6">
//       <EvidenceManagement />
//     </main>
//   );
// }

import EvidenceManagement from "@/components/evidence/evidence-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ProtectedEvidencePage() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <EvidenceManagement />
    </main>
  );
}

export default function EvidencePage() {
  return (
    <Suspense fallback={<main className="p-6">Loading evidence...</main>}>
      <ProtectedEvidencePage />
    </Suspense>
  );
}