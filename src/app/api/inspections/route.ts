
// import { NextRequest, NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// const allowedStatuses = [
//   "Scheduled",
//   "In Progress",
//   "Completed",
//   "Cancelled",
// ];

// const allowedResults = [
//   "Theft Confirmed",
//   "Meter Fault",
//   "No Issue",
//   "Inconclusive",
// ];

// export async function GET() {
//   try {
//     const result = await pool.query(`
//       SELECT
//         i.inspection_id,
//         i.investigation_id,
//         inv.case_number,
//         inv.case_status,
//         a.anomaly_id,
//         m.meter_number,
//         c.consumer_name,
//         i.scheduled_date,
//         i.inspection_date,
//         i.inspection_status,
//         i.findings,
//         i.result,
//         i.created_at
//       FROM inspections i
//       JOIN investigations inv
//         ON i.investigation_id = inv.investigation_id
//       JOIN anomalies a
//         ON inv.anomaly_id = a.anomaly_id
//       JOIN meters m
//         ON a.meter_id = m.meter_id
//       JOIN consumers c
//         ON m.consumer_id = c.consumer_id
//       ORDER BY i.created_at DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       inspections: result.rows,
//     });
//   } catch (error) {
//     console.error("Inspections GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to fetch inspections." },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const investigationId = Number(body.investigation_id);
//     const scheduledDate = body.scheduled_date;

//     if (
//       !Number.isInteger(investigationId) ||
//       investigationId <= 0 ||
//       !scheduledDate ||
//       Number.isNaN(Date.parse(scheduledDate))
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please provide a valid investigation and scheduled date.",
//         },
//         { status: 400 }
//       );
//     }

//     const investigationCheck = await pool.query(
//       `SELECT investigation_id
//        FROM investigations
//        WHERE investigation_id = $1`,
//       [investigationId]
//     );

//     if (investigationCheck.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Investigation case not found." },
//         { status: 404 }
//       );
//     }

//     const result = await pool.query(
//       `INSERT INTO inspections
//        (investigation_id, scheduled_date, inspection_status)
//        VALUES ($1, $2, 'Scheduled')
//        RETURNING *`,
//       [investigationId, scheduledDate]
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Inspection scheduled successfully.",
//         inspection: result.rows[0],
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Inspections POST error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to schedule inspection." },
//       { status: 500 }
//     );
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

const allowedStatuses = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];

const allowedResults = [
  "Theft Confirmed",
  "Meter Fault",
  "No Issue",
  "Inconclusive",
];

export async function GET() {
  try {
    const permission = await checkPermission("inspections:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(`
      SELECT
        i.inspection_id,
        i.investigation_id,
        inv.case_number,
        inv.case_status,
        a.anomaly_id,
        m.meter_number,
        c.consumer_name,
        i.scheduled_date,
        i.inspection_date,
        i.inspection_status,
        i.findings,
        i.result,
        i.created_at
      FROM inspections i
      JOIN investigations inv
        ON i.investigation_id = inv.investigation_id
      JOIN anomalies a
        ON inv.anomaly_id = a.anomaly_id
      JOIN meters m
        ON a.meter_id = m.meter_id
      JOIN consumers c
        ON m.consumer_id = c.consumer_id
      ORDER BY i.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      inspections: result.rows,
    });
  } catch (error) {
    console.error("Inspections GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch inspections." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const permission = await checkPermission("inspections:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const investigationId = Number(body.investigation_id);
    const scheduledDate = body.scheduled_date;

    if (
      !Number.isInteger(investigationId) ||
      investigationId <= 0 ||
      !scheduledDate ||
      Number.isNaN(Date.parse(scheduledDate))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid investigation and scheduled date.",
        },
        { status: 400 }
      );
    }

    const investigationCheck = await pool.query(
      `SELECT investigation_id
       FROM investigations
       WHERE investigation_id = $1`,
      [investigationId]
    );

    if (investigationCheck.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Investigation case not found." },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO inspections
       (investigation_id, scheduled_date, inspection_status)
       VALUES ($1, $2, 'Scheduled')
       RETURNING *`,
      [investigationId, scheduledDate]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Inspection scheduled successfully.",
        inspection: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Inspections POST error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to schedule inspection." },
      { status: 500 }
    );
  }
}