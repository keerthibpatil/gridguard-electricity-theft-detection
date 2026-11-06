
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// export async function PUT(request: Request, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const meterId = Number(id);

//     if (!Number.isInteger(meterId) || meterId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid meter ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();

//     const meterNumber = body.meter_number?.trim();
//     const consumerId = Number(body.consumer_id);
//     const transformerId =
//       body.transformer_id === "" || body.transformer_id == null
//         ? null
//         : Number(body.transformer_id);
//     const meterType = body.meter_type?.trim();
//     const installationDate = body.installation_date;
//     const meterStatus = body.meter_status;

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
//       `UPDATE meters
//        SET meter_number = $1,
//            consumer_id = $2,
//            transformer_id = $3,
//            meter_type = $4,
//            installation_date = $5,
//            meter_status = $6
//        WHERE meter_id = $7
//        RETURNING *`,
//       [
//         meterNumber,
//         consumerId,
//         transformerId,
//         meterType,
//         installationDate,
//         meterStatus,
//         meterId,
//       ]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Meter not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       meter: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Error updating meter:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Could not update meter. Check the meter number and linked records.",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(_: Request, context: RouteContext) {
//   try {
//     const { id } = await context.params;
//     const meterId = Number(id);

//     if (!Number.isInteger(meterId) || meterId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid meter ID." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `DELETE FROM meters
//        WHERE meter_id = $1
//        RETURNING meter_id`,
//       [meterId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Meter not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting meter:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Cannot delete this meter because readings or anomalies may be linked to it.",
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
    const permission = await checkPermission("meters:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const meterId = Number(id);

    if (!Number.isInteger(meterId) || meterId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid meter ID." },
        { status: 400 }
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
    const meterStatus = body.meter_status;

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
      `UPDATE meters
       SET meter_number = $1,
           consumer_id = $2,
           transformer_id = $3,
           meter_type = $4,
           installation_date = $5,
           meter_status = $6
       WHERE meter_id = $7
       RETURNING *`,
      [
        meterNumber,
        consumerId,
        transformerId,
        meterType,
        installationDate,
        meterStatus,
        meterId,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Meter not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      meter: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating meter:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not update meter. Check the meter number and linked records.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const permission = await checkPermission("meters:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const meterId = Number(id);

    if (!Number.isInteger(meterId) || meterId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid meter ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM meters
       WHERE meter_id = $1
       RETURNING meter_id`,
      [meterId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Meter not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meter:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Cannot delete this meter because readings or anomalies may be linked to it.",
      },
      { status: 409 }
    );
  }
}