
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// export async function PUT(request: Request, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const feederId = Number(id);

//     if (!Number.isInteger(feederId) || feederId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid feeder ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const feederName = body.feeder_name?.trim();
//     const location = body.location?.trim();
//     const capacity = Number(body.capacity_kw);
//     const status = body.status;

//     if (
//       !feederName ||
//       !location ||
//       !Number.isFinite(capacity) ||
//       capacity <= 0
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Enter valid feeder details." },
//         { status: 400 }
//       );
//     }

//     if (!["Active", "Inactive", "Maintenance"].includes(status)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid feeder status." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `UPDATE feeders
//        SET feeder_name = $1,
//            location = $2,
//            capacity_kw = $3,
//            status = $4
//        WHERE feeder_id = $5
//        RETURNING *`,
//       [feederName, location, capacity, status, feederId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Feeder not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       feeder: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Error updating feeder:", error);
//     return NextResponse.json(
//       { success: false, message: "Could not update feeder. Its name may already exist." },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(_: Request, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const feederId = Number(id);

//     if (!Number.isInteger(feederId) || feederId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid feeder ID." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       "DELETE FROM feeders WHERE feeder_id = $1 RETURNING feeder_id",
//       [feederId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Feeder not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting feeder:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Cannot delete this feeder because a transformer may be linked to it.",
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
    const permission = await checkPermission("feeders:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const feederId = Number(id);

    if (!Number.isInteger(feederId) || feederId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid feeder ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const feederName = body.feeder_name?.trim();
    const location = body.location?.trim();
    const capacity = Number(body.capacity_kw);
    const status = body.status;

    if (
      !feederName ||
      !location ||
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Enter valid feeder details." },
        { status: 400 }
      );
    }

    if (!["Active", "Inactive", "Maintenance"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid feeder status." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE feeders
       SET feeder_name = $1,
           location = $2,
           capacity_kw = $3,
           status = $4
       WHERE feeder_id = $5
       RETURNING *`,
      [feederName, location, capacity, status, feederId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Feeder not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feeder: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating feeder:", error);
    return NextResponse.json(
      { success: false, message: "Could not update feeder. Its name may already exist." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const permission = await checkPermission("feeders:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const feederId = Number(id);

    if (!Number.isInteger(feederId) || feederId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid feeder ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM feeders WHERE feeder_id = $1 RETURNING feeder_id",
      [feederId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Feeder not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feeder:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Cannot delete this feeder because a transformer may be linked to it.",
      },
      { status: 409 }
    );
  }
}
