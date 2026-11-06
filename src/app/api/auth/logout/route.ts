
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { pool } from "@/lib/postgres";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("gridguard_session")?.value;

    if (sessionToken) {
      const tokenHash = createHash("sha256")
        .update(sessionToken)
        .digest("hex");

      await pool.query(
        "DELETE FROM user_sessions WHERE token_hash = $1",
        [tokenHash]
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set("gridguard_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to log out." },
      { status: 500 }
    );
  }
}
