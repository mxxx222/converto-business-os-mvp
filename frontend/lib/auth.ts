import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "support" | "readonly" | "user";

interface SupabaseUserLike {
  email?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Derive business role from Supabase user metadata.
 * Mirrors backend RBAC mapping so UI gating matches API rules.
 */
export function deriveUserRole(user: SupabaseUserLike | null): UserRole {
  if (!user) return "user";

  const appMeta = (user as any).app_metadata || {};
  const userMeta = (user as any).user_metadata || {};

  const roleKeys = ["role", "user_role", "user_type"];
  let roleValue: string | undefined;

  for (const key of roleKeys) {
    if (appMeta[key]) {
      roleValue = String(appMeta[key]);
      break;
    }
    if (userMeta[key]) {
      roleValue = String(userMeta[key]);
      break;
    }
  }

  const role = (roleValue || "user").toLowerCase();
  if (role.startsWith("admin") || role === "owner") return "admin";
  if (role.startsWith("support")) return "support";
  if (role.startsWith("read")) return "readonly";
  return "user";
}

/**
 * Build Authorization headers for backend API calls using current Supabase session.
 * If there is no active session, returns an empty header object.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  } catch {
    // Fail open: no auth headers if we cannot read session
    return {};
  }
}



