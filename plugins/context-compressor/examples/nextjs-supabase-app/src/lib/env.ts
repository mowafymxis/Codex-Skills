export const env = {
  supabaseUrl: required(process.env.NEXT_PUBLIC_SUPABASE_URL),
  stripeSecretKey: required(process.env.STRIPE_SECRET_KEY)
};

function required(value: string | undefined): string {
  if (!value) throw new Error("Missing required env var");
  return value;
}
