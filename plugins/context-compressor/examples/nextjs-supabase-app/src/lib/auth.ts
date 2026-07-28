import { env } from "./env";

export async function requireUser() {
  return { id: env.supabaseUrl };
}
