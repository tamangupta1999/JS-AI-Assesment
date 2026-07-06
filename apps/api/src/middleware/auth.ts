import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@repo/shared";
import { verifyAccessToken } from "../lib/auth-tokens.js";
import type { EnvConfig } from "../types.js";

export function createAuthenticate(config: EnvConfig) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Authentication required" });
    }

    const token = authHeader.slice(7);
    try {
      const payload = verifyAccessToken(token, config);
      const user = await request.server.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, payload.sub),
      });

      if (!user) {
        return reply.status(401).send({ error: "User not found" });
      }

      const session = await request.server.db.query.sessions.findFirst({
        where: (sessions, { eq, and, gt }) =>
          and(
            eq(sessions.id, payload.sessionId),
            eq(sessions.userId, user.id),
            gt(sessions.expiresAt, new Date())
          ),
      });

      if (!session) {
        return reply.status(401).send({ error: "Session expired or invalid" });
      }

      request.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      };
      request.sessionId = payload.sessionId;
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }
  };
}

export function authorize(...allowedRoles: UserRole[]) {
  return async function authorizeRoles(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ error: "Insufficient permissions" });
    }
  };
}
