
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { pool } from "@/lib/postgres";

export type AuthUser = {
  user_id: number;
  full_name: string;
  username: string;
  role: "Admin" | "Investigator";
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("gridguard_session")?.value;

    if (!sessionToken) {
      return null;
    }

    const tokenHash = createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const result = await pool.query(
      `SELECT
         u.user_id,
         u.full_name,
         u.username,
         u.role,
         s.expires_at
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > CURRENT_TIMESTAMP
         AND u.is_active = TRUE`,
      [tokenHash]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const user = result.rows[0];

    return {
      user_id: user.user_id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export async function requireRole(
  allowedRoles: AuthUser["role"][]
): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
