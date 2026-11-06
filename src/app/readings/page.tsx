import ReadingManagement from "@/components/readings/reading-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReadingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <ReadingManagement canManage={user.role === "Admin"} />
    </main>
  );
}