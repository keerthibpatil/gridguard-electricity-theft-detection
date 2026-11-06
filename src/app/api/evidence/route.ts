
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(`
//       SELECT
//         e.evidence_id,
//         e.inspection_id,
//         e.evidence_type,
//         e.file_path,
//         e.description,
//         e.collected_at,
//         i.inspection_status,
//         inv.case_number,
//         m.meter_number,
//         c.consumer_name AS consumer_name
//       FROM evidence e
//       JOIN inspections i
//         ON e.inspection_id = i.inspection_id
//       JOIN investigations inv
//         ON i.investigation_id = inv.investigation_id
//       JOIN anomalies a
//         ON inv.anomaly_id = a.anomaly_id
//       JOIN meters m
//         ON a.meter_id = m.meter_id
//       JOIN consumers c
//         ON m.consumer_id = c.consumer_id
//       ORDER BY e.collected_at DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       evidence: result.rows,
//     });
//   } catch (error) {
//     console.error("Evidence GET error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch evidence records.",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const {
//       inspection_id,
//       evidence_type,
//       file_path,
//       description,
//     } = body;

//     if (
//       !inspection_id ||
//       !Number.isInteger(Number(inspection_id)) ||
//       Number(inspection_id) <= 0 ||
//       typeof evidence_type !== "string" ||
//       !evidence_type.trim() ||
//       typeof file_path !== "string" ||
//       !file_path.trim() ||
//       (description !== undefined && typeof description !== "string")
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "A valid inspection, evidence type, and file path are required.",
//         },
//         { status: 400 }
//       );
//     }

//     const inspection = await pool.query(
//       `SELECT inspection_id
//        FROM inspections
//        WHERE inspection_id = $1`,
//       [Number(inspection_id)]
//     );

//     if (inspection.rowCount === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Selected inspection does not exist.",
//         },
//         { status: 404 }
//       );
//     }

//     const result = await pool.query(
//       `INSERT INTO evidence (
//         inspection_id,
//         evidence_type,
//         file_path,
//         description
//       )
//       VALUES ($1, $2, $3, $4)
//       RETURNING *`,
//       [
//         Number(inspection_id),
//         evidence_type.trim(),
//         file_path.trim(),
//         description?.trim() || null,
//       ]
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Evidence record added successfully.",
//         evidence: result.rows[0],
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Evidence POST error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to add evidence record.",
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
    const permission = await checkPermission("evidence:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(`
      SELECT
        e.evidence_id,
        e.inspection_id,
        e.evidence_type,
        e.file_path,
        e.description,
        e.collected_at,
        i.inspection_status,
        inv.case_number,
        m.meter_number,
        c.consumer_name AS consumer_name
      FROM evidence e
      JOIN inspections i
        ON e.inspection_id = i.inspection_id
      JOIN investigations inv
        ON i.investigation_id = inv.investigation_id
      JOIN anomalies a
        ON inv.anomaly_id = a.anomaly_id
      JOIN meters m
        ON a.meter_id = m.meter_id
      JOIN consumers c
        ON m.consumer_id = c.consumer_id
      ORDER BY e.collected_at DESC
    `);

    return NextResponse.json({
      success: true,
      evidence: result.rows,
    });
  } catch (error) {
    console.error("Evidence GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch evidence records.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const permission = await checkPermission("evidence:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const {
      inspection_id,
      evidence_type,
      file_path,
      description,
    } = body;

    if (
      !inspection_id ||
      !Number.isInteger(Number(inspection_id)) ||
      Number(inspection_id) <= 0 ||
      typeof evidence_type !== "string" ||
      !evidence_type.trim() ||
      typeof file_path !== "string" ||
      !file_path.trim() ||
      (description !== undefined && typeof description !== "string")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid inspection, evidence type, and file path are required.",
        },
        { status: 400 }
      );
    }

    const inspection = await pool.query(
      `SELECT inspection_id
       FROM inspections
       WHERE inspection_id = $1`,
      [Number(inspection_id)]
    );

    if (inspection.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected inspection does not exist.",
        },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO evidence (
        inspection_id,
        evidence_type,
        file_path,
        description
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        Number(inspection_id),
        evidence_type.trim(),
        file_path.trim(),
        description?.trim() || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Evidence record added successfully.",
        evidence: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Evidence POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add evidence record.",
      },
      { status: 500 }
    );
  }
}