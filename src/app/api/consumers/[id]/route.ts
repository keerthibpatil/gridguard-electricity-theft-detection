// import { NextRequest, NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// export async function PUT(
//   request: NextRequest,
//   context: RouteContext
// ) {
//   try {
//     const { id } = await context.params;
//     const consumerId = Number(id);

//     if (!Number.isSafeInteger(consumerId) || consumerId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid consumer ID." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const {
//       consumer_name,
//       address,
//       phone,
//       email,
//       connection_type,
//     } = body;

//     if (
//       typeof consumer_name !== "string" ||
//       !consumer_name.trim() ||
//       typeof address !== "string" ||
//       !address.trim() ||
//       typeof phone !== "string" ||
//       !phone.trim() ||
//       typeof email !== "string" ||
//       !email.trim() ||
//       !["Residential", "Commercial", "Industrial"].includes(connection_type)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Please provide all valid consumer details." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `UPDATE consumers
//        SET consumer_name = $1,
//            address = $2,
//            phone = $3,
//            email = $4,
//            connection_type = $5,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE consumer_id = $6
//        RETURNING *`,
//       [
//         consumer_name.trim(),
//         address.trim(),
//         phone.trim(),
//         email.trim().toLowerCase(),
//         connection_type,
//         consumerId,
//       ]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Consumer not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       consumer: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Update consumer error:", error);

//     return NextResponse.json(
//       { success: false, message: "Unable to update consumer. Phone or email may already exist." },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   context: RouteContext
// ) {
//   try {
//     const { id } = await context.params;
//     const consumerId = Number(id);

//     if (!Number.isSafeInteger(consumerId) || consumerId <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid consumer ID." },
//         { status: 400 }
//       );
//     }

//     const result = await pool.query(
//       `DELETE FROM consumers
//        WHERE consumer_id = $1
//        RETURNING consumer_id`,
//       [consumerId]
//     );

//     if (result.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Consumer not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Consumer deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Delete consumer error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to delete consumer. A linked meter may prevent deletion.",
//       },
//       { status: 500 }
//     );
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const permission = await checkPermission("consumers:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const consumerId = Number(id);

    if (!Number.isSafeInteger(consumerId) || consumerId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid consumer ID." },
        { status: 400 }
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
      typeof consumer_name !== "string" ||
      !consumer_name.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      !["Residential", "Commercial", "Industrial"].includes(connection_type)
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all valid consumer details." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE consumers
       SET consumer_name = $1,
           address = $2,
           phone = $3,
           email = $4,
           connection_type = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE consumer_id = $6
       RETURNING *`,
      [
        consumer_name.trim(),
        address.trim(),
        phone.trim(),
        email.trim().toLowerCase(),
        connection_type,
        consumerId,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Consumer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      consumer: result.rows[0],
    });
  } catch (error) {
    console.error("Update consumer error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update consumer. Phone or email may already exist." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const permission = await checkPermission("consumers:manage");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const { id } = await context.params;
    const consumerId = Number(id);

    if (!Number.isSafeInteger(consumerId) || consumerId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid consumer ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM consumers
       WHERE consumer_id = $1
       RETURNING consumer_id`,
      [consumerId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Consumer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Consumer deleted successfully.",
    });
  } catch (error) {
    console.error("Delete consumer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete consumer. A linked meter may prevent deletion.",
      },
      { status: 500 }
    );
  }
}
