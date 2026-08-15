import { env } from "./env";

export function createCheckout() {
  return { stripeKey: env.stripeSecretKey };
}
