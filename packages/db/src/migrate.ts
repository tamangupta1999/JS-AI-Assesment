import { migrate } from "drizzle-orm/postgres-js/migrator";
import { config } from "dotenv";
import { createDb } from "./index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

config({ path: path.resolve(process.cwd(), "../../.env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const { db, client } = createDb(connectionString);
  await migrate(db, { migrationsFolder: path.join(__dirname, "../migrations") });
  await client.end();
  console.log("Migrations completed successfully");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
