
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(
//       `SELECT
//          m.meter_id,
//          m.meter_number,
//          m.consumer_id,
//          c.consumer_name,
//          m.transformer_id,
//          t.transformer_name,
//          m.meter_type,
//          m.installation_date,
//          m.meter_status,
//          m.created_at
//        FROM meters m
//        JOIN consumers c ON m.consumer_id = c.consumer_id
//        LEFT JOIN transformers t ON m.transformer_id = t.transformer_id
//        ORDER BY m.meter_id DESC`
//     );

//     return NextResponse.json({
//       success: true,
//       meters: result.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching meters:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch meters." },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const meterNumber = body.meter_number?.trim();
//     const consumerId = Number(body.consumer_id);
//     const transformerId =
//       body.transformer_id === "" || body.transformer_id == null
//         ? null
//         : Number(body.transformer_id);
//     const meterType = body.meter_type?.trim();
//     const installationDate = body.installation_date;
//     const meterStatus = body.meter_status || "Active";

//     if (
//       !meterNumber ||
//       !Number.isInteger(consumerId) ||
//       consumerId <= 0 ||
//       !meterType ||
//       !installationDate ||
//       Number.isNaN(Date.parse(installationDate)) ||
//       (transformerId !== null &&
//         (!Number.isInteger(transformerId) || transformerId <= 0))
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Enter valid meter details." },
//         { status: 400 }
//       );
//     }

//     if (!["Active", "Inactive", "Faulty", "Removed"].includes(meterStatus)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid meter status." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `INSERT INTO meters
//          (meter_number, consumer_id, transformer_id, meter_type,
//           installation_date, meter_status)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        RETURNING *`,
//       [
//         meterNumber,
//         consumerId,
//         transformerId,
//         meterType,
//         installationDate,
//         meterStatus,
//       ]
//     );

//     return NextResponse.json(
//       { success: true, meter: result.rows[0] },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating meter:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Could not create meter. Check the meter number and linked consumer/transformer.",
//       },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

// GET: Fetch all smart meters
export async function GET() {
  try {
    const permission = await checkPermission("meters:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(
      `SELECT
         m.meter_id,
         m.meter_number,
         m.consumer_id,
         c.consumer_name,
         m.transformer_id,
         t.transformer_name,
         m.meter_type,
         m.installation_date,
         m.meter_status,
         m.created_at
       FROM meters m
       JOIN consumers c ON m.consumer_id = c.consumer_id
       LEFT JOIN transformers t ON m.transformer_id = t.transformer_id
       ORDER BY m.meter_id DESC`
    );

    return NextResponse.json({
      success: true,
      meters: result.rows,
    });
  } catch (error) {
    console.error("Error fetching meters:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch meters." },
      { status: 500 }
    );
  }
}

// POST: Create a new smart meter
export async function POST(request: Request) {
  try {
    const permission = await checkPermission("meters:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const meterNumber = body.meter_number?.trim();
    const consumerId = Number(body.consumer_id);
    const transformerId =
      body.transformer_id === "" || body.transformer_id == null
        ? null
        : Number(body.transformer_id);
    const meterType = body.meter_type?.trim();
    const installationDate = body.installation_date;
    const meterStatus = body.meter_status || "Active";

    if (
      !meterNumber ||
      !Number.isInteger(consumerId) ||
      consumerId <= 0 ||
      !meterType ||
      !installationDate ||
      Number.isNaN(Date.parse(installationDate)) ||
      (transformerId !== null &&
        (!Number.isInteger(transformerId) || transformerId <= 0))
    ) {
      return NextResponse.json(
        { success: false, message: "Enter valid meter details." },
        { status: 400 }
      );
    }

    if (!["Active", "Inactive", "Faulty", "Removed"].includes(meterStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid meter status." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO meters
         (meter_number, consumer_id, transformer_id, meter_type,
          installation_date, meter_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        meterNumber,
        consumerId,
        transformerId,
        meterType,
        installationDate,
        meterStatus,
      ]
    );

    return NextResponse.json(
      { success: true, meter: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating meter:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Could not create meter. Check the meter number and linked consumer/transformer.",
      },
      { status: 500 }
    );
  }
}