import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import {
  createTestApp,
  createTicket,
  loginAs,
  updateTicketStatus,
} from "../helpers.js";

const DEV_PASSWORD = "Password123!";

describe("Ticket State Machine Integration Tests", () => {
  let app: FastifyInstance;
  let adminToken: string;
  let ticketId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAs(app, "admin", DEV_PASSWORD);
    const ticket = await createTicket(app, adminToken, {
      title: "State machine test ticket",
      description: "Ticket for integration testing state transitions",
      priority: "medium",
    });
    ticketId = ticket.id;
    expect(ticket.status).toBe("open");
  });

  afterAll(async () => {
    await app.close();
  });

  describe("valid transitions", () => {
    it("open -> in_progress succeeds", async () => {
      const result = await updateTicketStatus(
        app,
        adminToken,
        ticketId,
        "in_progress"
      );
      expect(result.statusCode).toBe(200);
      expect((result.body as { ticket: { status: string } }).ticket.status).toBe(
        "in_progress"
      );
    });

    it("in_progress -> resolved succeeds", async () => {
      const result = await updateTicketStatus(
        app,
        adminToken,
        ticketId,
        "resolved"
      );
      expect(result.statusCode).toBe(200);
      expect((result.body as { ticket: { status: string } }).ticket.status).toBe(
        "resolved"
      );
    });

    it("resolved -> closed succeeds", async () => {
      const result = await updateTicketStatus(
        app,
        adminToken,
        ticketId,
        "closed"
      );
      expect(result.statusCode).toBe(200);
      expect((result.body as { ticket: { status: string } }).ticket.status).toBe(
        "closed"
      );
    });
  });

  describe("invalid transitions on closed ticket", () => {
    it("closed -> open is rejected", async () => {
      const result = await updateTicketStatus(
        app,
        adminToken,
        ticketId,
        "open"
      );
      expect(result.statusCode).toBe(409);
      expect((result.body as { error: string }).error).toContain(
        "Cannot transition"
      );
    });

    it("closed -> in_progress is rejected", async () => {
      const result = await updateTicketStatus(
        app,
        adminToken,
        ticketId,
        "in_progress"
      );
      expect(result.statusCode).toBe(409);
    });

    it("closed -> cancelled is rejected", async () => {
      const result = await updateTicketStatus(
        app,
        adminToken,
        ticketId,
        "cancelled"
      );
      expect(result.statusCode).toBe(409);
    });
  });
});

describe("Cancellation path", () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAs(app, "admin", DEV_PASSWORD);
  });

  afterAll(async () => {
    await app.close();
  });

  it("open -> cancelled succeeds", async () => {
    const ticket = await createTicket(app, adminToken, {
      title: "Cancel test ticket",
      description: "Testing cancellation from open",
    });

    const result = await updateTicketStatus(
      app,
      adminToken,
      ticket.id,
      "cancelled"
    );
    expect(result.statusCode).toBe(200);
    expect((result.body as { ticket: { status: string } }).ticket.status).toBe(
      "cancelled"
    );
  });

  it("in_progress -> cancelled succeeds", async () => {
    const ticket = await createTicket(app, adminToken, {
      title: "Cancel from in_progress",
      description: "Testing cancellation from in_progress",
    });

    await updateTicketStatus(app, adminToken, ticket.id, "in_progress");
    const result = await updateTicketStatus(
      app,
      adminToken,
      ticket.id,
      "cancelled"
    );
    expect(result.statusCode).toBe(200);
    expect((result.body as { ticket: { status: string } }).ticket.status).toBe(
      "cancelled"
    );
  });

  it("cancelled -> any status is rejected", async () => {
    const ticket = await createTicket(app, adminToken, {
      title: "Terminal cancelled ticket",
      description: "Testing terminal state",
    });

    await updateTicketStatus(app, adminToken, ticket.id, "cancelled");
    const result = await updateTicketStatus(
      app,
      adminToken,
      ticket.id,
      "open"
    );
    expect(result.statusCode).toBe(409);
  });

  it("open -> resolved is rejected (must go through in_progress)", async () => {
    const ticket = await createTicket(app, adminToken, {
      title: "Invalid skip transition",
      description: "Cannot skip in_progress",
    });

    const result = await updateTicketStatus(
      app,
      adminToken,
      ticket.id,
      "resolved"
    );
    expect(result.statusCode).toBe(409);
  });

  it("open -> closed is rejected", async () => {
    const ticket = await createTicket(app, adminToken, {
      title: "Invalid direct close",
      description: "Cannot close from open",
    });

    const result = await updateTicketStatus(
      app,
      adminToken,
      ticket.id,
      "closed"
    );
    expect(result.statusCode).toBe(409);
  });
});

describe("Auth Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("login with valid credentials returns token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "admin", password: DEV_PASSWORD },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { accessToken: string; user: { role: string } };
    expect(body.accessToken).toBeTruthy();
    expect(body.user.role).toBe("admin");
  });

  it("login with invalid credentials returns 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "admin", password: "wrongpassword" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("protected route without token returns 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/tickets",
    });

    expect(response.statusCode).toBe(401);
  });

  it("logout invalidates session", async () => {
    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "user1", password: DEV_PASSWORD },
    });

    const { accessToken } = loginResponse.json() as { accessToken: string };
    const cookies = loginResponse.cookies;

    const logoutResponse = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { authorization: `Bearer ${accessToken}` },
      cookies: Object.fromEntries(
        cookies.map((c) => [c.name, c.value])
      ) as Record<string, string>,
    });

    expect(logoutResponse.statusCode).toBe(200);

    const meResponse = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(meResponse.statusCode).toBe(401);
  });

  it("user role cannot access admin users endpoint", async () => {
    const token = await loginAs(app, "user1", DEV_PASSWORD);

    const response = await app.inject({
      method: "GET",
      url: "/users",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
  });
});
