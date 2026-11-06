
// import { NextRequest, NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// const allowedStatuses = [
//   "Open",
//   "Assigned",
//   "In Progress",
//   "On Hold",
//   "Closed",
// ];

// const allowedOutcomes = [
//   "Pending",
//   "Confirmed Theft",
//   "Meter Fault",
//   "No Issue Found",
//   "Inconclusive",
// ];

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const investigationId = Number(id);

//     if (!Number.isInteger(investigationId) || investigationId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid investigation ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const { case_status, outcome, notes } = body;

//     // Validate case status
//     if (
//       typeof case_status !== "string" ||
//       !allowedStatuses.includes(case_status)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid case status." },
//         { status: 400 }
//       );
//     }

//     // Validate investigation outcome
//     if (
//       typeof outcome !== "string" ||
//       !allowedOutcomes.includes(outcome)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid investigation outcome." },
//         { status: 400 }
//       );
//     }

//     // Validate notes
//     if (notes !== null && notes !== undefined && typeof notes !== "string") {
//       return NextResponse.json(
//         { success: false, message: "Notes must be text." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `
//         UPDATE investigations
//         SET
//           case_status = $1::VARCHAR(30),
//           outcome = $2::VARCHAR(30),
//           notes = $3::TEXT,
//           closed_at = CASE
//             WHEN $4::VARCHAR(30) = 'Closed'
//               THEN COALESCE(closed_at, CURRENT_TIMESTAMP)
//             ELSE NULL
//           END
//         WHERE investigation_id = $5
//         RETURNING *
//       `,
//       [
//         case_status,
//         outcome,
//         notes ?? null,
//         case_status,
//         investigationId,
//       ]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Investigation case not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Investigation updated successfully.",
//       investigation: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Investigation PUT error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to update investigation." },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

const allowedStatuses = [
  "Open",
  "Assigned",
  "In Progress",
  "On Hold",
  "Closed",
];

const allowedOutcomes = [
  "Pending",
  "Confirmed Theft",
  "Meter Fault",
  "No Issue Found",
  "Inconclusive",
];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await checkPermission("investigations:update");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await params;
    const investigationId = Number(id);

    if (!Number.isInteger(investigationId) || investigationId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid investigation ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { case_status, outcome, notes } = body;

    if (
      typeof case_status !== "string" ||
      !allowedStatuses.includes(case_status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid case status." },
        { status: 400 }
      );
    }

    if (
      typeof outcome !== "string" ||
      !allowedOutcomes.includes(outcome)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid investigation outcome." },
        { status: 400 }
      );
    }

    if (notes !== null && notes !== undefined && typeof notes !== "string") {
      return NextResponse.json(
        { success: false, message: "Notes must be text." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        UPDATE investigations
        SET
          case_status = $1::VARCHAR(30),
          outcome = $2::VARCHAR(30),
          notes = $3::TEXT,
          closed_at = CASE
            WHEN $4::VARCHAR(30) = 'Closed'
              THEN COALESCE(closed_at, CURRENT_TIMESTAMP)
            ELSE NULL
          END
        WHERE investigation_id = $5
        RETURNING *
      `,
      [
        case_status,
        outcome,
        notes ?? null,
        case_status,
        investigationId,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Investigation case not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Investigation updated successfully.",
      investigation: result.rows[0],
    });
  } catch (error) {
    console.error("Investigation PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update investigation." },
      { status: 500 }
    );
  }
}