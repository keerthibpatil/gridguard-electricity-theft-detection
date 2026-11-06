import InvestigationManagement from "@/components/investigations/investigation-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvestigationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <InvestigationManagement />
    </main>
  );
}