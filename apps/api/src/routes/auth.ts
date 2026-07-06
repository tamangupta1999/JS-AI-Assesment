import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { sessions, users } from "@repo/db";
import {
  loginSchema,
  registerSchema,
} from "@repo/shared";
import {
  clearRefreshCookie,
  generateRefreshToken,
  getRefreshExpiry,
  getRefreshTokenFromRequest,
  hashToken,
  setRefreshCookie,
  signAccessToken,
} from "../lib/auth-tokens.js";
import { createAuthenticate } from "../middleware/auth.js";

export async function authRoutes(fastify: FastifyInstance) {
  const authenticate = createAuthenticate(fastify.config);

  fastify.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { username, email, name, password } = parsed.data;

    const existing = await fastify.db.query.users.findFirst({
      where: (u, { or, eq }) =>
        or(eq(u.username, username), eq(u.email, email)),
    });

    if (existing) {
      return reply.status(409).send({
        error: "Username or email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await fastify.db
      .insert(users)
      .values({ username, email, name, passwordHash, role: "user" })
      .returning();

    const refreshToken = generateRefreshToken();
    const [session] = await fastify.db
      .insert(sessions)
      .values({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: getRefreshExpiry(),
      })
      .returning();

    const accessToken = signAccessToken(
      { sub: user.id, role: user.role, sessionId: session.id },
      fastify.config
    );

    setRefreshCookie(reply, refreshToken, fastify.config);

    return reply.status(201).send({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  fastify.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { username, password } = parsed.data;
    const user = await fastify.db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return reply.status(401).send({ error: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid username or password" });
    }

    const refreshToken = generateRefreshToken();
    const [session] = await fastify.db
      .insert(sessions)
      .values({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: getRefreshExpiry(),
      })
      .returning();

    const accessToken = signAccessToken(
      { sub: user.id, role: user.role, sessionId: session.id },
      fastify.config
    );

    setRefreshCookie(reply, refreshToken, fastify.config);

    return reply.send({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  fastify.post("/auth/refresh", async (request, reply) => {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token required" });
    }

    const tokenHash = hashToken(refreshToken);
    const session = await fastify.db.query.sessions.findFirst({
      where: (s, { eq, and, gt }) =>
        and(eq(s.tokenHash, tokenHash), gt(s.expiresAt, new Date())),
    });

    if (!session) {
      clearRefreshCookie(reply, fastify.config);
      return reply.status(401).send({ error: "Invalid or expired session" });
    }

    const user = await fastify.db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    const accessToken = signAccessToken(
      { sub: user.id, role: user.role, sessionId: session.id },
      fastify.config
    );

    return reply.send({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  fastify.post(
    "/auth/logout",
    { preHandler: authenticate },
    async (request, reply) => {
      if (request.sessionId) {
        await fastify.db
          .delete(sessions)
          .where(eq(sessions.id, request.sessionId));
      }

      const refreshToken = getRefreshTokenFromRequest(request);
      if (refreshToken) {
        await fastify.db
          .delete(sessions)
          .where(eq(sessions.tokenHash, hashToken(refreshToken)));
      }

      clearRefreshCookie(reply, fastify.config);
      return reply.send({ message: "Logged out successfully" });
    }
  );

  fastify.get(
    "/auth/me",
    { preHandler: authenticate },
    async (request) => {
      return { user: request.user };
    }
  );
}
