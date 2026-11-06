
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(`
//       SELECT
//         i.investigation_id,
//         i.anomaly_id,
//         i.case_number,
//         i.case_status,
//         i.outcome,
//         i.notes,
//         i.opened_at,
//         i.closed_at,
//         a.anomaly_type,
//         a.anomaly_score,
//         a.severity,
//         m.meter_number,
//         c.consumer_name
//       FROM investigations i
//       JOIN anomalies a ON i.anomaly_id = a.anomaly_id
//       JOIN meters m ON a.meter_id = m.meter_id
//       JOIN consumers c ON m.consumer_id = c.consumer_id
//       ORDER BY i.opened_at DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       investigations: result.rows,
//     });
//   } catch (error) {
//     console.error("Investigations GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to fetch investigations." },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

// GET: Fetch all investigations
export async function GET() {
  try {
    const permission = await checkPermission("investigations:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(`
      SELECT
        i.investigation_id,
        i.anomaly_id,
        i.case_number,
        i.case_status,
        i.outcome,
        i.notes,
        i.opened_at,
        i.closed_at,
        a.anomaly_type,
        a.anomaly_score,
        a.severity,
        m.meter_number,
        c.consumer_name
      FROM investigations i
      JOIN anomalies a ON i.anomaly_id = a.anomaly_id
      JOIN meters m ON a.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      ORDER BY i.opened_at DESC
    `);

    return NextResponse.json({
      success: true,
      investigations: result.rows,
    });
  } catch (error) {
    console.error("Investigations GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch investigations." },
      { status: 500 }
    );
  }
}