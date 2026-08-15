import type { Account } from "../../src/types/domain";
import { requireUser } from "../../src/lib/auth";
import { getDbClient } from "../../src/lib/db";
import { createCheckout } from "../../src/lib/payments";

export default async function DashboardPage() {
  await requireUser();
  getDbClient();
  createCheckout();
  const account: Account = { id: "1", email: "demo@example.com" };
  return account.email;
}
