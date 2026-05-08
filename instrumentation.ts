export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: migrator } = await import("./models/migrator");
    await migrator.runMigrations();
  }
}
