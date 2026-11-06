// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const [
//       consumers,
//       meters,
//       anomalies,
//       investigations,
//     ] = await Promise.all([
//       pool.query("SELECT COUNT(*) FROM consumers"),
//       pool.query(
//         "SELECT COUNT(*) FROM meters WHERE meter_status = 'Active'"
//       ),
//       pool.query("SELECT COUNT(*) FROM anomalies"),
//       pool.query(
//         "SELECT COUNT(*) FROM investigations WHERE case_status <> 'Closed'"
//       ),
//     ]);

//     return NextResponse.json({
//       success: true,
//       statistics: {
//         totalConsumers: Number(consumers.rows[0].count),
//         activeMeters: Number(meters.rows[0].count),
//         detectedAnomalies: Number(anomalies.rows[0].count),
//         openInvestigations: Number(investigations.rows[0].count),
//       },
//     });
//   } catch (error) {
//     console.error("Dashboard statistics error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to load dashboard statistics.",
//       },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const permission = await checkPermission("dashboard:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const [
      consumers,
      meters,
      anomalies,
      investigations,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM consumers"),
      pool.query(
        "SELECT COUNT(*) FROM meters WHERE meter_status = 'Active'"
      ),
      pool.query("SELECT COUNT(*) FROM anomalies"),
      pool.query(
        "SELECT COUNT(*) FROM investigations WHERE case_status <> 'Closed'"
      ),
    ]);

    return NextResponse.json({
      success: true,
      statistics: {
        totalConsumers: Number(consumers.rows[0].count),
        activeMeters: Number(meters.rows[0].count),
        detectedAnomalies: Number(anomalies.rows[0].count),
        openInvestigations: Number(investigations.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}