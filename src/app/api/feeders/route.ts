
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(
//       `SELECT feeder_id, feeder_name, location, capacity_kw,
//               status, created_at
//        FROM feeders
//        ORDER BY feeder_id DESC`
//     );

//     return NextResponse.json({
//       success: true,
//       feeders: result.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching feeders:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch feeders" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const feederName = body.feeder_name?.trim();
//     const location = body.location?.trim();
//     const capacity = Number(body.capacity_kw);
//     const status = body.status || "Active";

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
//       `INSERT INTO feeders (feeder_name, location, capacity_kw, status)
//        VALUES ($1, $2, $3, $4)
//        RETURNING *`,
//       [feederName, location, capacity, status]
//     );

//     return NextResponse.json(
//       { success: true, feeder: result.rows[0] },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating feeder:", error);
//     return NextResponse.json(
//       { success: false, message: "Could not create feeder. Check whether its name already exists." },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

// GET: Fetch all feeders
export async function GET() {
  try {
    const permission = await checkPermission("feeders:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(
      `SELECT feeder_id, feeder_name, location, capacity_kw,
              status, created_at
       FROM feeders
       ORDER BY feeder_id DESC`
    );

    return NextResponse.json({
      success: true,
      feeders: result.rows,
    });
  } catch (error) {
    console.error("Error fetching feeders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feeders" },
      { status: 500 }
    );
  }
}

// POST: Create a new feeder
export async function POST(request: Request) {
  try {
    const permission = await checkPermission("feeders:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const feederName = body.feeder_name?.trim();
    const location = body.location?.trim();
    const capacity = Number(body.capacity_kw);
    const status = body.status || "Active";

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
      `INSERT INTO feeders (feeder_name, location, capacity_kw, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [feederName, location, capacity, status]
    );

    return NextResponse.json(
      { success: true, feeder: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating feeder:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not create feeder. Check whether its name already exists.",
      },
      { status: 500 }
    );
  }
}
