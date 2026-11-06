// import { NextRequest, NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(
//       `SELECT consumer_id, consumer_name, address, phone, email,
//               connection_type, created_at
//        FROM consumers
//        ORDER BY consumer_id DESC`
//     );

//     return NextResponse.json({
//       success: true,
//       consumers: result.rows,
//     });
//   } catch (error) {
//     console.error("Fetch consumers error:", error);

//     return NextResponse.json(
//       { success: false, message: "Unable to fetch consumers." },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const {
//       consumer_name,
//       address,
//       phone,
//       email,
//       connection_type,
//     } = body;

//     if (
//       !consumer_name?.trim() ||
//       !address?.trim() ||
//       !phone?.trim() ||
//       !email?.trim() ||
//       !["Residential", "Commercial", "Industrial"].includes(connection_type)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Please provide all valid consumer details." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `INSERT INTO consumers
//        (consumer_name, address, phone, email, connection_type)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING *`,
//       [
//         consumer_name.trim(),
//         address.trim(),
//         phone.trim(),
//         email.trim().toLowerCase(),
//         connection_type,
//       ]
//     );

//     return NextResponse.json(
//       { success: true, consumer: result.rows[0] },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Create consumer error:", error);

//     return NextResponse.json(
//       { success: false, message: "Unable to create consumer. Check whether the phone or email already exists." },
//       { status: 500 }
//     );
//   }
// }




import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const permission = await checkPermission("consumers:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(
      `SELECT consumer_id, consumer_name, address, phone, email,
              connection_type, created_at
       FROM consumers
       ORDER BY consumer_id DESC`
    );

    return NextResponse.json({
      success: true,
      consumers: result.rows,
    });
  } catch (error) {
    console.error("Fetch consumers error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch consumers." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const permission = await checkPermission("consumers:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const {
      consumer_name,
      address,
      phone,
      email,
      connection_type,
    } = body;

    if (
      !consumer_name?.trim() ||
      !address?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !["Residential", "Commercial", "Industrial"].includes(connection_type)
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all valid consumer details." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO consumers
       (consumer_name, address, phone, email, connection_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        consumer_name.trim(),
        address.trim(),
        phone.trim(),
        email.trim().toLowerCase(),
        connection_type,
      ]
    );

    return NextResponse.json(
      { success: true, consumer: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create consumer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create consumer. Check whether the phone or email already exists.",
      },
      { status: 500 }
    );
  }
}
