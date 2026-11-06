
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// export async function PUT(request: Request, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const transformerId = Number(id);

//     if (!Number.isInteger(transformerId) || transformerId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid transformer ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const transformerName = body.transformer_name?.trim();
//     const feederId = Number(body.feeder_id);
//     const location = body.location?.trim();
//     const capacity = Number(body.capacity_kva);
//     const status = body.status;

//     if (
//       !transformerName ||
//       !location ||
//       !Number.isInteger(feederId) ||
//       feederId <= 0 ||
//       !Number.isFinite(capacity) ||
//       capacity <= 0
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Enter valid transformer details." },
//         { status: 400 }
//       );
//     }

//     if (!["Active", "Inactive", "Maintenance"].includes(status)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid transformer status." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `UPDATE transformers
//        SET transformer_name = $1,
//            feeder_id = $2,
//            location = $3,
//            capacity_kva = $4,
//            status = $5
//        WHERE transformer_id = $6
//        RETURNING *`,
//       [transformerName, feederId, location, capacity, status, transformerId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Transformer not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       transformer: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Error updating transformer:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Could not update transformer. Check its name and feeder.",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(_: Request, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const transformerId = Number(id);

//     if (!Number.isInteger(transformerId) || transformerId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid transformer ID." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `DELETE FROM transformers
//        WHERE transformer_id = $1
//        RETURNING transformer_id`,
//       [transformerId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Transformer not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting transformer:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Cannot delete this transformer because a meter may be linked to it.",
//       },
//       { status: 409 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const permission = await checkPermission("transformers:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const transformerId = Number(id);

    if (!Number.isInteger(transformerId) || transformerId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid transformer ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const transformerName = body.transformer_name?.trim();
    const feederId = Number(body.feeder_id);
    const location = body.location?.trim();
    const capacity = Number(body.capacity_kva);
    const status = body.status;

    if (
      !transformerName ||
      !location ||
      !Number.isInteger(feederId) ||
      feederId <= 0 ||
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Enter valid transformer details." },
        { status: 400 }
      );
    }

    if (!["Active", "Inactive", "Maintenance"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid transformer status." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE transformers
       SET transformer_name = $1,
           feeder_id = $2,
           location = $3,
           capacity_kva = $4,
           status = $5
       WHERE transformer_id = $6
       RETURNING *`,
      [transformerName, feederId, location, capacity, status, transformerId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Transformer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transformer: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating transformer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not update transformer. Check its name and feeder.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const permission = await checkPermission("transformers:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const transformerId = Number(id);

    if (!Number.isInteger(transformerId) || transformerId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid transformer ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM transformers
       WHERE transformer_id = $1
       RETURNING transformer_id`,
      [transformerId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Transformer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transformer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Cannot delete this transformer because a meter may be linked to it.",
      },
      { status: 409 }
    );
  }
}