
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(`
//       SELECT
//         al.alert_id,
//         al.anomaly_id,
//         al.alert_message,
//         al.priority,
//         al.alert_status,
//         al.created_at,
//         a.anomaly_type,
//         a.anomaly_score,
//         m.meter_number,
//         c.consumer_name,
//         i.case_number
//       FROM alerts al
//       JOIN anomalies a ON al.anomaly_id = a.anomaly_id
//       JOIN meters m ON a.meter_id = m.meter_id
//       JOIN consumers c ON m.consumer_id = c.consumer_id
//       LEFT JOIN investigations i ON i.anomaly_id = a.anomaly_id
//       ORDER BY al.created_at DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       alerts: result.rows,
//     });
//   } catch (error) {
//     console.error("Alerts GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to fetch alerts." },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

// GET: Fetch all alerts
export async function GET() {
  try {
    const permission = await checkPermission("alerts:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(`
      SELECT
        al.alert_id,
        al.anomaly_id,
        al.alert_message,
        al.priority,
        al.alert_status,
        al.created_at,
        a.anomaly_type,
        a.anomaly_score,
        m.meter_number,
        c.consumer_name,
        i.case_number
      FROM alerts al
      JOIN anomalies a ON al.anomaly_id = a.anomaly_id
      JOIN meters m ON a.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      LEFT JOIN investigations i ON i.anomaly_id = a.anomaly_id
      ORDER BY al.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      alerts: result.rows,
    });
  } catch (error) {
    console.error("Alerts GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch alerts." },
      { status: 500 }
    );
  }
}