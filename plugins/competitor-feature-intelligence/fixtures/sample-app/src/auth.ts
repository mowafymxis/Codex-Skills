export function authenticate(session: { userId?: string }) {
  if (!session.userId) throw new Error("login required");
  return { userId: session.userId, jwt: "test-fixture-token-placeholder" };
}
