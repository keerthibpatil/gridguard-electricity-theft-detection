import { getCurrentUser, type AuthUser } from "@/lib/auth";

export type Permission =
  | "dashboard:view"
  | "consumers:view"
  | "consumers:manage"
  | "feeders:view"
  | "feeders:manage"
  | "transformers:view"
  | "transformers:manage"
  | "meters:view"
  | "meters:manage"
  | "readings:view"
  | "readings:create"
  | "anomalies:view"
  | "alerts:view"
  | "investigations:view"
  | "investigations:update"
  | "inspections:view"
  | "inspections:manage"
  | "evidence:view"
  | "evidence:manage"
  | "meter-events:view"
  | "meter-events:create"
  | "users:manage";

const rolePermissions: Record<AuthUser["role"], Permission[]> = {
  Admin: [
    "dashboard:view",
    "consumers:view", "consumers:manage",
    "feeders:view", "feeders:manage",
    "transformers:view", "transformers:manage",
    "meters:view", "meters:manage",
    "readings:view", "readings:create",
    "anomalies:view", "alerts:view",
    "investigations:view", "investigations:update",
    "inspections:view", "inspections:manage",
    "evidence:view", "evidence:manage",
    "meter-events:view", "meter-events:create",
    "users:manage",
  ],

  Investigator: [
    "dashboard:view",
    "consumers:view",
    "feeders:view",
    "transformers:view",
    "meters:view",
    "readings:view",
    "anomalies:view",
    "alerts:view",
    "investigations:view", "investigations:update",
    "inspections:view", "inspections:manage",
    "evidence:view", "evidence:manage",
    "meter-events:view", "meter-events:create",
  ],
};

export function hasPermission(
  role: AuthUser["role"],
  permission: Permission
): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getRolePermissions(
  role: AuthUser["role"]
): Permission[] {
  return rolePermissions[role] ?? [];
}

export async function checkPermission(permission: Permission) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      allowed: false,
      status: 401,
      message: "Unauthorized. Please log in.",
    };
  }

  if (!hasPermission(user.role, permission)) {
    return {
      user,
      allowed: false,
      status: 403,
      message: "Forbidden. You do not have permission.",
    };
  }

  return {
    user,
    allowed: true,
    status: 200,
    message: "Permission granted.",
  };
}