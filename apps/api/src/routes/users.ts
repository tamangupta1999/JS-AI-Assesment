import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { users } from "@repo/db";
import { updateUserRoleSchema } from "@repo/shared";
import { createAuthenticate, authorize } from "../middleware/auth.js";

export async function userRoutes(fastify: FastifyInstance) {
  const authenticate = createAuthenticate(fastify.config);

  fastify.get(
    "/users",
    { preHandler: [authenticate, authorize("admin")] },
    async (_request, reply) => {
      const allUsers = await fastify.db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users);

      return reply.send({ users: allUsers });
    }
  );

  fastify.patch(
    "/users/:id/role",
    { preHandler: [authenticate, authorize("admin")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateUserRoleSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const existing = await fastify.db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!existing) {
        return reply.status(404).send({ error: "User not found" });
      }

      if (existing.id === request.user!.id && parsed.data.role !== "admin") {
        return reply.status(400).send({
          error: "Cannot demote yourself from admin role",
        });
      }

      const [updated] = await fastify.db
        .update(users)
        .set({ role: parsed.data.role })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
        });

      return reply.send({ user: updated });
    }
  );
}
