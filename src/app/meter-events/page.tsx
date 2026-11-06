// import MeterEventManagement from "@/components/meter-events/meter-event-management";

// export default function MeterEventsPage() {
//   return (
//     <main className="p-6">
//       <MeterEventManagement />
//     </main>
//   );
// }



import MeterEventManagement from "@/components/meter-events/meter-event-management";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MeterEventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <MeterEventManagement />
    </main>
  );
}