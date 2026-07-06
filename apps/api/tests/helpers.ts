import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import type { EnvConfig } from "../src/types.js";

export const testConfig: EnvConfig = {
  port: 0,
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/tickets",
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? "test-access-secret-min-32-characters",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-min-32-characters",
  nodeEnv: "test",
  cookieSecure: false,
};

export async function createTestApp(): Promise<FastifyInstance> {
  return buildApp(testConfig);
}

export async function loginAs(
  app: FastifyInstance,
  username: string,
  password: string
): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { username, password },
  });

  if (response.statusCode !== 200) {
    throw new Error(`Login failed for ${username}: ${response.body}`);
  }

  const body = response.json() as { accessToken: string };
  return body.accessToken;
}

export async function createTicket(
  app: FastifyInstance,
  token: string,
  data: { title: string; description: string; priority?: string }
): Promise<{ id: string; status: string }> {
  const response = await app.inject({
    method: "POST",
    url: "/tickets",
    headers: { authorization: `Bearer ${token}` },
    payload: data,
  });

  if (response.statusCode !== 201) {
    throw new Error(`Create ticket failed: ${response.body}`);
  }

  const body = response.json() as { ticket: { id: string; status: string } };
  return body.ticket;
}

export async function updateTicketStatus(
  app: FastifyInstance,
  token: string,
  ticketId: string,
  status: string
): Promise<{ statusCode: number; body: unknown }> {
  const response = await app.inject({
    method: "PATCH",
    url: `/tickets/${ticketId}/status`,
    headers: { authorization: `Bearer ${token}` },
    payload: { status },
  });

  return {
    statusCode: response.statusCode,
    body: response.json(),
  };
}
