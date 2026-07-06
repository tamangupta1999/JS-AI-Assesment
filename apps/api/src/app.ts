import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { EnvConfig } from "./types.js";
import { dbPlugin } from "./plugins/db.js";
import { authRoutes } from "./routes/auth.js";
import { ticketRoutes } from "./routes/tickets.js";
import { userRoutes } from "./routes/users.js";

export async function buildApp(config: EnvConfig) {
  const fastify = Fastify({
    logger: config.nodeEnv !== "test",
  });

  fastify.decorate("config", config);

  await fastify.register(cors, {
    origin: config.nodeEnv === "production"
      ? process.env.WEB_URL ?? "http://localhost:3000"
      : true,
    credentials: true,
  });

  await fastify.register(cookie);

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Support Ticket Management API",
        description: "API for managing support tickets",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
  });

  await fastify.register(dbPlugin);

  fastify.get("/health", async () => ({ status: "ok" }));

  fastify.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    fastify.log.error(error);
    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : error.message,
    });
  });

  await fastify.register(authRoutes);
  await fastify.register(ticketRoutes);
  await fastify.register(userRoutes);

  return fastify;
}
