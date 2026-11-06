
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(`
//       SELECT
//         a.anomaly_id,
//         a.reading_id,
//         a.meter_id,
//         m.meter_number,
//         c.consumer_name,
//         a.anomaly_type,
//         a.anomaly_score,
//         a.severity,
//         a.description,
//         a.detected_at,
//         a.status,
//         i.case_number,
//         i.case_status
//       FROM anomalies a
//       JOIN meters m ON a.meter_id = m.meter_id
//       JOIN consumers c ON m.consumer_id = c.consumer_id
//       LEFT JOIN investigations i ON i.anomaly_id = a.anomaly_id
//       ORDER BY a.detected_at DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       anomalies: result.rows,
//     });
//   } catch (error) {
//     console.error("Anomalies GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to fetch anomalies." },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { getCurrentUser } from "@/lib/auth";

// GET: Fetch all detected anomalies
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const result = await pool.query(`
      SELECT
        a.anomaly_id,
        a.reading_id,
        a.meter_id,
        m.meter_number,
        c.consumer_name,
        a.anomaly_type,
        a.anomaly_score,
        a.severity,
        a.description,
        a.detected_at,
        a.status,
        i.case_number,
        i.case_status
      FROM anomalies a
      JOIN meters m ON a.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      LEFT JOIN investigations i ON i.anomaly_id = a.anomaly_id
      ORDER BY a.detected_at DESC
    `);

    return NextResponse.json({
      success: true,
      anomalies: result.rows,
    });
  } catch (error) {
    console.error("Anomalies GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch anomalies." },
      { status: 500 }
    );
  }
}