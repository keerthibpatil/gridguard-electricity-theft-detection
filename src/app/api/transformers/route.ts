
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(
//       `SELECT
//          t.transformer_id,
//          t.transformer_name,
//          t.feeder_id,
//          f.feeder_name,
//          t.location,
//          t.capacity_kva,
//          t.status,
//          t.created_at
//        FROM transformers t
//        JOIN feeders f ON t.feeder_id = f.feeder_id
//        ORDER BY t.transformer_id DESC`
//     );

//     return NextResponse.json({
//       success: true,
//       transformers: result.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching transformers:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch transformers." },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const transformerName = body.transformer_name?.trim();
//     const feederId = Number(body.feeder_id);
//     const location = body.location?.trim();
//     const capacity = Number(body.capacity_kva);
//     const status = body.status || "Active";

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
//       `INSERT INTO transformers
//          (transformer_name, feeder_id, location, capacity_kva, status)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING *`,
//       [transformerName, feederId, location, capacity, status]
//     );

//     return NextResponse.json(
//       { success: true, transformer: result.rows[0] },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating transformer:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Could not create transformer. Check the feeder ID and transformer name.",
//       },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

// GET: Fetch all transformers
export async function GET() {
  try {
    const permission = await checkPermission("transformers:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(
      `SELECT
         t.transformer_id,
         t.transformer_name,
         t.feeder_id,
         f.feeder_name,
         t.location,
         t.capacity_kva,
         t.status,
         t.created_at
       FROM transformers t
       JOIN feeders f ON t.feeder_id = f.feeder_id
       ORDER BY t.transformer_id DESC`
    );

    return NextResponse.json({
      success: true,
      transformers: result.rows,
    });
  } catch (error) {
    console.error("Error fetching transformers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transformers." },
      { status: 500 }
    );
  }
}

// POST: Create a new transformer
export async function POST(request: Request) {
  try {
    const permission = await checkPermission("transformers:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const transformerName = body.transformer_name?.trim();
    const feederId = Number(body.feeder_id);
    const location = body.location?.trim();
    const capacity = Number(body.capacity_kva);
    const status = body.status || "Active";

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
      `INSERT INTO transformers
         (transformer_name, feeder_id, location, capacity_kva, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [transformerName, feederId, location, capacity, status]
    );

    return NextResponse.json(
      { success: true, transformer: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transformer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not create transformer. Check the feeder ID and transformer name.",
      },
      { status: 500 }
    );
  }
}