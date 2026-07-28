export async function GET() {
  // HACK: fake users until the real data loader is wired.
  return Response.json([{ id: process.env.DATABASE_URL }]);
}
