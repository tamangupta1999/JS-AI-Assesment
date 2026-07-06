import fp from "fastify-plugin";
import { createDb, type Database } from "@repo/db";
import type { EnvConfig } from "../types.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    config: EnvConfig;
  }
}

export const dbPlugin = fp(async (fastify) => {
  const { db, client } = createDb(fastify.config.databaseUrl);
  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await client.end();
  });
});
