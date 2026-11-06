// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// type Context = {
//   params: Promise<{ id: string }>;
// };

// export async function PUT(request: Request, context: Context) {
//   try {
//     const { id } = await context.params;
//     const evidenceId = Number(id);

//     if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid evidence ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const { evidence_type, file_path, description } = body;

//     if (!evidence_type?.trim() || !file_path?.trim()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Evidence type and file path are required.",
//         },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `UPDATE evidence
//        SET evidence_type = $1,
//            file_path = $2,
//            description = $3
//        WHERE evidence_id = $4
//        RETURNING *`,
//       [
//         evidence_type.trim(),
//         file_path.trim(),
//         description?.trim() || null,
//         evidenceId,
//       ]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Evidence record not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Evidence record updated successfully.",
//       evidence: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Evidence PUT error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to update evidence record." },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(_request: Request, context: Context) {
//   try {
//     const { id } = await context.params;
//     const evidenceId = Number(id);

//     if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid evidence ID." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `DELETE FROM evidence
//        WHERE evidence_id = $1
//        RETURNING evidence_id`,
//       [evidenceId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Evidence record not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Evidence record deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Evidence DELETE error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to delete evidence record." },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
  try {
    const permission = await checkPermission("evidence:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const evidenceId = Number(id);

    if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { evidence_type, file_path, description } = body;

    if (
      typeof evidence_type !== "string" ||
      !evidence_type.trim() ||
      typeof file_path !== "string" ||
      !file_path.trim() ||
      (description !== undefined &&
        description !== null &&
        typeof description !== "string")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Evidence type and file path are required.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE evidence
       SET evidence_type = $1,
           file_path = $2,
           description = $3
       WHERE evidence_id = $4
       RETURNING *`,
      [
        evidence_type.trim(),
        file_path.trim(),
        description?.trim() || null,
        evidenceId,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Evidence record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evidence record updated successfully.",
      evidence: result.rows[0],
    });
  } catch (error) {
    console.error("Evidence PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update evidence record." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const permission = await checkPermission("evidence:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const evidenceId = Number(id);

    if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM evidence
       WHERE evidence_id = $1
       RETURNING evidence_id`,
      [evidenceId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Evidence record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evidence record deleted successfully.",
    });
  } catch (error) {
    console.error("Evidence DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete evidence record." },
      { status: 500 }
    );
  }
}