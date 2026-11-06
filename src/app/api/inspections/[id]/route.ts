
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

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const inspectionId = Number(id);

//     if (!Number.isInteger(inspectionId) || inspectionId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid inspection ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const { inspection_status, findings, result, inspection_date } = body;

//     if (
//       typeof inspection_status !== "string" ||
//       !allowedStatuses.includes(inspection_status)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid inspection status." },
//         { status: 400 }
//       );
//     }

//     if (
//       result !== null &&
//       result !== undefined &&
//       !allowedResults.includes(result)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid inspection result." },
//         { status: 400 }
//       );
//     }

//     if (findings !== null && findings !== undefined && typeof findings !== "string") {
//       return NextResponse.json(
//         { success: false, message: "Findings must be text." },
//         { status: 400 }
//       );
//     }

//     if (
//       inspection_date &&
//       Number.isNaN(Date.parse(inspection_date))
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid inspection date." },
//         { status: 400 }
//       );
//     }

//     if (
//       inspection_status === "Completed" &&
//       (!result || !inspection_date)
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "A completed inspection requires an inspection date and result.",
//         },
//         { status: 400 }
//       );
//     }

//     const finalInspectionDate =
//       inspection_status === "Completed"
//         ? inspection_date
//         : inspection_date || null;

//     const query = `
//       UPDATE inspections
//       SET
//         inspection_status = $1::VARCHAR(20),
//         findings = $2::TEXT,
//         result = $3::VARCHAR(30),
//         inspection_date = $4::DATE
//       WHERE inspection_id = $5
//       RETURNING *
//     `;

//     const values = [
//       inspection_status,
//       findings ?? null,
//       result ?? null,
//       finalInspectionDate,
//       inspectionId,
//     ];

//     const updated = await pool.query(query, values);

//     if (updated.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Inspection not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Inspection updated successfully.",
//       inspection: updated.rows[0],
//     });
//   } catch (error) {
//     console.error("Inspection PUT error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to update inspection." },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const inspectionId = Number(id);

//     if (!Number.isInteger(inspectionId) || inspectionId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid inspection ID." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `DELETE FROM inspections
//        WHERE inspection_id = $1
//        RETURNING inspection_id`,
//       [inspectionId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Inspection not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Inspection deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Inspection DELETE error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to delete inspection. Linked evidence may prevent deletion.",
//       },
//       { status: 409 }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await checkPermission("inspections:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await params;
    const inspectionId = Number(id);

    if (!Number.isInteger(inspectionId) || inspectionId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid inspection ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { inspection_status, findings, result, inspection_date } = body;

    if (
      typeof inspection_status !== "string" ||
      !allowedStatuses.includes(inspection_status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid inspection status." },
        { status: 400 }
      );
    }

    if (
      result !== null &&
      result !== undefined &&
      !allowedResults.includes(result)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid inspection result." },
        { status: 400 }
      );
    }

    if (
      findings !== null &&
      findings !== undefined &&
      typeof findings !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Findings must be text." },
        { status: 400 }
      );
    }

    if (
      inspection_date &&
      Number.isNaN(Date.parse(inspection_date))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid inspection date." },
        { status: 400 }
      );
    }

    if (
      inspection_status === "Completed" &&
      (!result || !inspection_date)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A completed inspection requires an inspection date and result.",
        },
        { status: 400 }
      );
    }

    const finalInspectionDate =
      inspection_status === "Completed"
        ? inspection_date
        : inspection_date || null;

    const query = `
      UPDATE inspections
      SET
        inspection_status = $1::VARCHAR(20),
        findings = $2::TEXT,
        result = $3::VARCHAR(30),
        inspection_date = $4::DATE
      WHERE inspection_id = $5
      RETURNING *
    `;

    const values = [
      inspection_status,
      findings ?? null,
      result ?? null,
      finalInspectionDate,
      inspectionId,
    ];

    const updated = await pool.query(query, values);

    if (updated.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Inspection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inspection updated successfully.",
      inspection: updated.rows[0],
    });
  } catch (error) {
    console.error("Inspection PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update inspection." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await checkPermission("inspections:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await params;
    const inspectionId = Number(id);

    if (!Number.isInteger(inspectionId) || inspectionId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid inspection ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM inspections
       WHERE inspection_id = $1
       RETURNING inspection_id`,
      [inspectionId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Inspection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inspection deleted successfully.",
    });
  } catch (error) {
    console.error("Inspection DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete inspection. Linked evidence may prevent deletion.",
      },
      { status: 409 }
    );
  }
}