import type { UserRole } from "@repo/shared";

export interface EnvConfig {
  port: number;
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  nodeEnv: string;
  cookieSecure: boolean;
}

export function loadConfig(): EnvConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  if (!jwtAccessSecret) throw new Error("JWT_ACCESS_SECRET is required");
  if (!jwtRefreshSecret) throw new Error("JWT_REFRESH_SECRET is required");

  return {
    port: parseInt(process.env.PORT ?? "4000", 10),
    databaseUrl,
    jwtAccessSecret,
    jwtRefreshSecret,
    nodeEnv: process.env.NODE_ENV ?? "development",
    cookieSecure: process.env.NODE_ENV === "production",
  };
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  sessionId: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
    sessionId?: string;
  }
}
