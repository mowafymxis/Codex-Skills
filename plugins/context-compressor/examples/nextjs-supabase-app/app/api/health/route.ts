import { env } from "../../../src/lib/env";

export function GET() {
  return Response.json({ ok: true, url: env.supabaseUrl });
}
