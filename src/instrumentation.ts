/** Runs once per server start, before any request is handled. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapDatabase } = await import("./db/bootstrap");
    await bootstrapDatabase();
  }
}
