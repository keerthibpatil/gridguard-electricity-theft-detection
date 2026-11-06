// import ConsumerManagement from "@/components/consumers/consumer-management";

// export default function ConsumersPage() {
//   return (
//     <main className="min-h-screen bg-slate-50 p-6 md:p-10">
//       <ConsumerManagement />
//     </main>
//   );
// }

// import ConsumerManagement from "@/components/consumers/consumer-management";
// import { getCurrentUser } from "@/lib/auth";
// import { redirect } from "next/navigation";
// import { connection } from "next/server";
// import { Suspense } from "react";

// async function ProtectedConsumersPage() {
//   await connection();

//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login");
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 p-6 md:p-10">
//       <ConsumerManagement />
//     </main>
//   );
// }

// export default function ConsumersPage() {
//   return (
//     <Suspense fallback={<main className="p-6">Loading consumers...</main>}>
//       <ProtectedConsumersPage />
//     </Suspense>
//   );
// }




import ConsumerManagement from "@/components/consumers/consumer-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ProtectedConsumersPage() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <ConsumerManagement canManage={user.role === "Admin"} />
    </main>
  );
}

export default function ConsumersPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading consumers...</main>}>
      <ProtectedConsumersPage />
    </Suspense>
  );
}
