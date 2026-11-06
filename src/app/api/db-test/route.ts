// import { NextResponse } from "next/server";
// import { pool } from "@/lib/postgres";
// import mongoClientPromise from "@/lib/mongodb";

// export async function GET() {
//   let postgresStatus = "Not connected";
//   let mongodbStatus = "Not connected";

//   try {
//     await pool.query("SELECT 1");
//     postgresStatus = "Connected";
//   } catch (error) {
//     console.error("PostgreSQL connection failed:", error);
//   }

//   try {
//     const client = await mongoClientPromise;
//     await client.db("admin").command({ ping: 1 });
//     mongodbStatus = "Connected";
//   } catch (error) {
//     console.error("MongoDB connection failed:", error);
//   }

//   const success =
//     postgresStatus === "Connected" &&
//     mongodbStatus === "Connected";

//   return NextResponse.json(
//     {
//       success,
//       databases: {
//         postgresql: postgresStatus,
//         mongodb: mongodbStatus,
//       },
//     },
//     { status: success ? 200 : 500 }
//   );
// }



import { NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import mongoClientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    let postgresStatus = "Not connected";
    let mongodbStatus = "Not connected";

    try {
      await pool.query("SELECT 1");
      postgresStatus = "Connected";
    } catch (error) {
      console.error("PostgreSQL connection failed:", error);
    }

    try {
      const client = await mongoClientPromise;
      await client.db("admin").command({ ping: 1 });
      mongodbStatus = "Connected";
    } catch (error) {
      console.error("MongoDB connection failed:", error);
    }

    const success =
      postgresStatus === "Connected" &&
      mongodbStatus === "Connected";

    return NextResponse.json(
      {
        success,
        databases: {
          postgresql: postgresStatus,
          mongodb: mongodbStatus,
        },
      },
      { status: success ? 200 : 500 }
    );
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify database connections." },
      { status: 500 }
    );
  }
}