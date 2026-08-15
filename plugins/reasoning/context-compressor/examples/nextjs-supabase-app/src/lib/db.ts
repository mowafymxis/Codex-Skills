import { env } from "./env";

export function getDbClient() {
  return { url: env.supabaseUrl };
}
