
import TransformerManagement from "@/components/transformers/transformer-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TransformersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <TransformerManagement canManage={user.role === "Admin"} />
    </main>
  );
}
