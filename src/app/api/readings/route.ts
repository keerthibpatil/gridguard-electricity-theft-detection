
// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";

// export async function GET() {
//   try {
//     const result = await pool.query(`
//       SELECT
//         r.reading_id,
//         r.meter_id,
//         m.meter_number,
//         c.consumer_name,
//         r.units_consumed,
//         r.voltage,
//         r.current_value,
//         r.reading_date
//       FROM electricity_readings r
//       JOIN meters m ON r.meter_id = m.meter_id
//       JOIN consumers c ON m.consumer_id = c.consumer_id
//       ORDER BY r.reading_date DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       readings: result.rows,
//     });
//   } catch (error) {
//     console.error("Readings GET error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to fetch readings" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   const client = await pool.connect();
//   let transactionStarted = false;

//   try {
//     const body = await request.json();

//     const meterId = Number(body.meter_id);
//     const units = Number(body.units_consumed);
//     const voltage = Number(body.voltage);
//     const current = Number(body.current_value);
//     const readingDate = body.reading_date;

//     // Validate submitted reading details
//     if (
//       !Number.isInteger(meterId) ||
//       meterId <= 0 ||
//       !Number.isFinite(units) ||
//       units < 0 ||
//       !Number.isFinite(voltage) ||
//       voltage <= 0 ||
//       !Number.isFinite(current) ||
//       current < 0 ||
//       !readingDate ||
//       Number.isNaN(Date.parse(readingDate))
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please enter valid reading details.",
//         },
//         { status: 400 }
//       );
//     }

//     await client.query("BEGIN");
//     transactionStarted = true;

//     // Check whether the selected meter is active
//     const meterResult = await client.query(
//       `SELECT meter_id
//        FROM meters
//        WHERE meter_id = $1
//        AND meter_status = 'Active'`,
//       [meterId]
//     );

//     if (meterResult.rowCount === 0) {
//       await client.query("ROLLBACK");
//       transactionStarted = false;

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Active meter not found.",
//         },
//         { status: 404 }
//       );
//     }

//     // Get the previous five readings for comparison
//     const previousResult = await client.query(
//       `SELECT units_consumed
//        FROM electricity_readings
//        WHERE meter_id = $1
//        ORDER BY reading_date DESC
//        LIMIT 5`,
//       [meterId]
//     );

//     const previousReadings = previousResult.rows.map(
//       (row) => Number(row.units_consumed)
//     );

//     let anomalyScore = 0;
//     const reasons: string[] = [];

//     // Detect unusual electricity consumption
//     if (previousReadings.length > 0) {
//       const average =
//         previousReadings.reduce((sum, value) => sum + value, 0) /
//         previousReadings.length;

//       if (units > average * 2 && units - average > 5) {
//         anomalyScore += 50;
//         reasons.push("Unusually high electricity consumption");
//       } else if (average > 0 && units < average * 0.3) {
//         anomalyScore += 40;
//         reasons.push("Unusually low electricity consumption");
//       } else if (average === 0 && units > 5) {
//         anomalyScore += 40;
//         reasons.push("Unexpected increase from zero consumption");
//       }
//     }

//     // Detect abnormal voltage
//     if (voltage < 210 || voltage > 250) {
//       anomalyScore += 40;
//       reasons.push("Voltage outside the expected range");
//     }

//     anomalyScore = Math.min(anomalyScore, 100);

//     // Save the electricity reading
//     const readingResult = await client.query(
//       `INSERT INTO electricity_readings
//        (
//          meter_id,
//          units_consumed,
//          voltage,
//          current_value,
//          reading_date
//        )
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING *`,
//       [meterId, units, voltage, current, readingDate]
//     );

//     let anomaly = null;

//     // Automatically create an anomaly when the score is 40 or higher
//     if (anomalyScore >= 40) {
//       const anomalyType = reasons.join("; ");

//       const anomalyResult = await client.query(
//         `INSERT INTO anomalies
//          (
//            reading_id,
//            meter_id,
//            anomaly_type,
//            anomaly_score,
//            severity,
//            description
//          )
//          VALUES (
//            $1,
//            $2,
//            $3,
//            $4,
//            classify_anomaly_severity($4),
//            $5
//          )
//          RETURNING *`,
//         [
//           readingResult.rows[0].reading_id,
//           meterId,
//           anomalyType,
//           anomalyScore,
//           anomalyType,
//         ]
//       );

//       anomaly = anomalyResult.rows[0];

//       // Database triggers automatically create:
//       // 1. An alert
//       // 2. An investigation case
//     }

//     await client.query("COMMIT");
//     transactionStarted = false;

//     return NextResponse.json(
//       {
//         success: true,
//         message: anomaly
//           ? "Reading saved. Anomaly detected; alert and investigation generated automatically."
//           : "Reading saved successfully. No anomaly detected.",
//         reading: readingResult.rows[0],
//         anomaly,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     if (transactionStarted) {
//       await client.query("ROLLBACK");
//     }

//     console.error("Readings POST error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Could not save reading. Check the entered values and try again.",
//       },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }





import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import { checkPermission } from "@/lib/permissions";

// GET: Fetch all electricity readings
export async function GET() {
  try {
    const permission = await checkPermission("readings:view");

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.message },
        { status: permission.status }
      );
    }

    const result = await pool.query(`
      SELECT
        r.reading_id,
        r.meter_id,
        m.meter_number,
        c.consumer_name,
        r.units_consumed,
        r.voltage,
        r.current_value,
        r.reading_date
      FROM electricity_readings r
      JOIN meters m ON r.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      ORDER BY r.reading_date DESC
    `);

    return NextResponse.json({
      success: true,
      readings: result.rows,
    });
  } catch (error) {
    console.error("Readings GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch readings" },
      { status: 500 }
    );
  }
}

// POST: Save a reading and automatically detect anomalies
export async function POST(request: Request) {
  const permission = await checkPermission("readings:create");

  if (!permission.allowed) {
    return NextResponse.json(
      { success: false, message: permission.message },
      { status: permission.status }
    );
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const body = await request.json();

    const meterId = Number(body.meter_id);
    const units = Number(body.units_consumed);
    const voltage = Number(body.voltage);
    const current = Number(body.current_value);
    const readingDate = body.reading_date;

    // Validate submitted reading details
    if (
      !Number.isInteger(meterId) ||
      meterId <= 0 ||
      !Number.isFinite(units) ||
      units < 0 ||
      !Number.isFinite(voltage) ||
      voltage <= 0 ||
      !Number.isFinite(current) ||
      current < 0 ||
      !readingDate ||
      Number.isNaN(Date.parse(readingDate))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter valid reading details.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Check whether the selected meter is active
    const meterResult = await client.query(
      `SELECT meter_id
       FROM meters
       WHERE meter_id = $1
       AND meter_status = 'Active'`,
      [meterId]
    );

    if (meterResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Active meter not found.",
        },
        { status: 404 }
      );
    }

    // Get the previous five readings for comparison
    const previousResult = await client.query(
      `SELECT units_consumed
       FROM electricity_readings
       WHERE meter_id = $1
       ORDER BY reading_date DESC
       LIMIT 5`,
      [meterId]
    );

    const previousReadings = previousResult.rows.map(
      (row) => Number(row.units_consumed)
    );

    let anomalyScore = 0;
    const reasons: string[] = [];

    // Detect unusual electricity consumption
    if (previousReadings.length > 0) {
      const average =
        previousReadings.reduce((sum, value) => sum + value, 0) /
        previousReadings.length;

      if (units > average * 2 && units - average > 5) {
        anomalyScore += 50;
        reasons.push("Unusually high electricity consumption");
      } else if (average > 0 && units < average * 0.3) {
        anomalyScore += 40;
        reasons.push("Unusually low electricity consumption");
      } else if (average === 0 && units > 5) {
        anomalyScore += 40;
        reasons.push("Unexpected increase from zero consumption");
      }
    }

    // Detect abnormal voltage
    if (voltage < 210 || voltage > 250) {
      anomalyScore += 40;
      reasons.push("Voltage outside the expected range");
    }

    anomalyScore = Math.min(anomalyScore, 100);

    // Save the electricity reading
    const readingResult = await client.query(
      `INSERT INTO electricity_readings
       (
         meter_id,
         units_consumed,
         voltage,
         current_value,
         reading_date
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [meterId, units, voltage, current, readingDate]
    );

    let anomaly = null;

    // Automatically create an anomaly when the score is 40 or higher
    if (anomalyScore >= 40) {
      const anomalyType = reasons.join("; ");

      const anomalyResult = await client.query(
        `INSERT INTO anomalies
         (
           reading_id,
           meter_id,
           anomaly_type,
           anomaly_score,
           severity,
           description
         )
         VALUES (
           $1,
           $2,
           $3,
           $4,
           classify_anomaly_severity($4),
           $5
         )
         RETURNING *`,
        [
          readingResult.rows[0].reading_id,
          meterId,
          anomalyType,
          anomalyScore,
          anomalyType,
        ]
      );

      anomaly = anomalyResult.rows[0];

      // Database triggers automatically create:
      // 1. An alert
      // 2. An investigation case
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: anomaly
          ? "Reading saved. Anomaly detected; alert and investigation generated automatically."
          : "Reading saved successfully. No anomaly detected.",
        reading: readingResult.rows[0],
        anomaly,
      },
      { status: 201 }
    );
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("Readings POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not save reading. Check the entered values and try again.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}