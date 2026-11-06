
import FeederManagement from "@/components/feeders/feeder-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ProtectedFeedersPage() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <FeederManagement canManage={user.role === "Admin"} />
    </main>
  );
}

export default function FeedersPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading feeders...</main>}>
      <ProtectedFeedersPage />
    </Suspense>
  );
}
