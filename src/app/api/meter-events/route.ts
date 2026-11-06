
// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("gridguard_events");

//     const events = await db
//       .collection("meter_events")
//       .find({})
//       .sort({ received_at: -1 })
//       .limit(100)
//       .toArray();

//     return NextResponse.json({
//       success: true,
//       events,
//     });
//   } catch (error) {
//     console.error("MongoDB events GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Unable to fetch meter events." },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const { meter_number, event_type, description, event_timestamp } = body;

//     const allowedEventTypes = [
//       "Tampering",
//       "Voltage Fluctuation",
//       "Power Outage",
//       "Device Diagnostic",
//     ];

//     if (
//       typeof meter_number !== "string" ||
//       !meter_number.trim() ||
//       typeof event_type !== "string" ||
//       !allowedEventTypes.includes(event_type) ||
//       typeof description !== "string" ||
//       !description.trim()
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Valid meter number, event type, and description are required.",
//         },
//         { status: 400 }
//       );
//     }

//     const timestamp = event_timestamp
//       ? new Date(event_timestamp)
//       : new Date();

//     if (Number.isNaN(timestamp.getTime())) {
//       return NextResponse.json(
//         { success: false, message: "Invalid event timestamp." },
//         { status: 400 }
//       );
//     }

//     // Verify that the meter exists in PostgreSQL.
//     const meter = await pool.query(
//       "SELECT meter_id FROM meters WHERE meter_number = $1",
//       [meter_number.trim()]
//     );

//     if (meter.rowCount === 0) {
//       return NextResponse.json(
//         { success: false, message: "Meter does not exist in GridGuard." },
//         { status: 404 }
//       );
//     }

//     const client = await clientPromise;
//     const db = client.db("gridguard_events");

//     // Create indexes for efficient event retrieval.
//     await db.collection("meter_events").createIndex({
//       meter_number: 1,
//       event_timestamp: -1,
//     });

//     await db.collection("meter_events").createIndex({
//       event_type: 1,
//     });

//     const event = {
//       meter_id: meter.rows[0].meter_id,
//       meter_number: meter_number.trim(),
//       event_type,
//       description: description.trim(),
//       event_timestamp: timestamp,
//       received_at: new Date(),
//     };

//     const result = await db
//       .collection("meter_events")
//       .insertOne(event);

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Meter event recorded successfully.",
//         event: {
//           ...event,
//           _id: result.insertedId,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("MongoDB events POST error:", error);

//     return NextResponse.json(
//       { success: false, message: "Unable to record meter event." },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const permission = await checkPermission("meter-events:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const client = await clientPromise;
    const db = client.db("gridguard_events");

    const events = await db
      .collection("meter_events")
      .find({})
      .sort({ received_at: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("MongoDB events GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch meter events." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const permission = await checkPermission("meter-events:create");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const { meter_number, event_type, description, event_timestamp } = body;

    const allowedEventTypes = [
      "Tampering",
      "Voltage Fluctuation",
      "Power Outage",
      "Device Diagnostic",
    ];

    if (
      typeof meter_number !== "string" ||
      !meter_number.trim() ||
      typeof event_type !== "string" ||
      !allowedEventTypes.includes(event_type) ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid meter number, event type, and description are required.",
        },
        { status: 400 }
      );
    }

    const timestamp = event_timestamp
      ? new Date(event_timestamp)
      : new Date();

    if (Number.isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid event timestamp." },
        { status: 400 }
      );
    }

    // Verify that the meter exists in PostgreSQL.
    const meter = await pool.query(
      "SELECT meter_id FROM meters WHERE meter_number = $1",
      [meter_number.trim()]
    );

    if (meter.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Meter does not exist in GridGuard." },
        { status: 404 }
      );
    }

    const client = await clientPromise;
    const db = client.db("gridguard_events");

    // Create indexes for efficient event retrieval.
    await db.collection("meter_events").createIndex({
      meter_number: 1,
      event_timestamp: -1,
    });

    await db.collection("meter_events").createIndex({
      event_type: 1,
    });

    const event = {
      meter_id: meter.rows[0].meter_id,
      meter_number: meter_number.trim(),
      event_type,
      description: description.trim(),
      event_timestamp: timestamp,
      received_at: new Date(),
    };

    const result = await db
      .collection("meter_events")
      .insertOne(event);

    return NextResponse.json(
      {
        success: true,
        message: "Meter event recorded successfully.",
        event: {
          ...event,
          _id: result.insertedId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("MongoDB events POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to record meter event." },
      { status: 500 }
    );
  }
}