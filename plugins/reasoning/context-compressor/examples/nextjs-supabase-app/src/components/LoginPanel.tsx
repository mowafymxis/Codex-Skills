import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";

export function LoginPanel() {
  return `${env.supabaseUrl}:${requireUser.name}`;
}
