import type { FastifyInstance } from "fastify";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import { comments, tickets, users } from "@repo/db";
import {
  createCommentSchema,
  createTicketSchema,
  ticketQuerySchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  type TicketStatus,
} from "@repo/shared";
import { createAuthenticate } from "../middleware/auth.js";
import {
  formatTransitionError,
  validateStatusTransition,
} from "../services/ticket-state-machine.js";

function canAccessTicket(
  user: { id: string; role: string },
  ticket: { createdBy: string; assignedTo: string | null }
): boolean {
  if (user.role === "admin" || user.role === "agent") return true;
  return (
    ticket.createdBy === user.id ||
    (ticket.assignedTo !== null && ticket.assignedTo === user.id)
  );
}

function canModifyTicket(
  user: { id: string; role: string },
  ticket: { createdBy: string }
): boolean {
  if (user.role === "admin" || user.role === "agent") return true;
  return ticket.createdBy === user.id;
}

export async function ticketRoutes(fastify: FastifyInstance) {
  const authenticate = createAuthenticate(fastify.config);

  fastify.get(
    "/tickets",
    { preHandler: authenticate },
    async (request, reply) => {
      const parsed = ticketQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const { q, status, priority, assignedTo, sort, order, page, limit } =
        parsed.data;
      const user = request.user!;
      const conditions: SQL[] = [];

      if (user.role === "user") {
        conditions.push(
          or(
            eq(tickets.createdBy, user.id),
            eq(tickets.assignedTo, user.id)
          )!
        );
      }

      if (status) conditions.push(eq(tickets.status, status));
      if (priority) conditions.push(eq(tickets.priority, priority));
      if (assignedTo) conditions.push(eq(tickets.assignedTo, assignedTo));

      if (q) {
        const pattern = `%${q}%`;
        conditions.push(
          or(
            ilike(tickets.title, pattern),
            ilike(tickets.description, pattern)
          )!
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const sortColumn = {
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        priority: tickets.priority,
        status: tickets.status,
      }[sort];

      const orderFn = order === "asc" ? asc : desc;

      const offset = (page - 1) * limit;

      const [ticketRows, totalResult] = await Promise.all([
        fastify.db
          .select()
          .from(tickets)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limit)
          .offset(offset),
        fastify.db
          .select({ count: count() })
          .from(tickets)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      const userIds = new Set<string>();
      for (const t of ticketRows) {
        userIds.add(t.createdBy);
        if (t.assignedTo) userIds.add(t.assignedTo);
      }

      const relatedUsers =
        userIds.size > 0
          ? await fastify.db
              .select({
                id: users.id,
                name: users.name,
                username: users.username,
              })
              .from(users)
              .where(inArray(users.id, [...userIds]))
          : [];

      const userMap = new Map(relatedUsers.map((u) => [u.id, u]));

      const enrichedTickets = ticketRows.map((t) => ({
        ...t,
        assigneeName: t.assignedTo
          ? (userMap.get(t.assignedTo)?.name ?? null)
          : null,
        creatorName: userMap.get(t.createdBy)?.name ?? null,
      }));

      return reply.send({
        tickets: enrichedTickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  );

  fastify.post(
    "/tickets",
    { preHandler: authenticate },
    async (request, reply) => {
      const parsed = createTicketSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const { title, description, priority, assignedTo } = parsed.data;

      if (assignedTo) {
        const assignee = await fastify.db.query.users.findFirst({
          where: eq(users.id, assignedTo),
        });
        if (!assignee) {
          return reply.status(400).send({ error: "Assignee not found" });
        }
      }

      const [ticket] = await fastify.db
        .insert(tickets)
        .values({
          title,
          description,
          priority,
          assignedTo: assignedTo ?? null,
          createdBy: request.user!.id,
        })
        .returning();

      return reply.status(201).send({ ticket });
    }
  );

  fastify.get(
    "/tickets/:id",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const ticket = await fastify.db.query.tickets.findFirst({
        where: eq(tickets.id, id),
      });

      if (!ticket) {
        return reply.status(404).send({ error: "Ticket not found" });
      }

      if (!canAccessTicket(request.user!, ticket)) {
        return reply.status(403).send({ error: "Access denied" });
      }

      const [assignee, creator] = await Promise.all([
        ticket.assignedTo
          ? fastify.db.query.users.findFirst({
              where: eq(users.id, ticket.assignedTo),
            })
          : null,
        fastify.db.query.users.findFirst({
          where: eq(users.id, ticket.createdBy),
        }),
      ]);

      return reply.send({
        ticket: {
          ...ticket,
          assignee: assignee
            ? { id: assignee.id, name: assignee.name, username: assignee.username }
            : null,
          creator: creator
            ? { id: creator.id, name: creator.name, username: creator.username }
            : null,
        },
      });
    }
  );

  fastify.patch(
    "/tickets/:id",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateTicketSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const ticket = await fastify.db.query.tickets.findFirst({
        where: eq(tickets.id, id),
      });

      if (!ticket) {
        return reply.status(404).send({ error: "Ticket not found" });
      }

      if (!canModifyTicket(request.user!, ticket)) {
        return reply.status(403).send({ error: "Access denied" });
      }

      const { assignedTo } = parsed.data;
      if (assignedTo) {
        const assignee = await fastify.db.query.users.findFirst({
          where: eq(users.id, assignedTo),
        });
        if (!assignee) {
          return reply.status(400).send({ error: "Assignee not found" });
        }
      }

      const [updated] = await fastify.db
        .update(tickets)
        .set(parsed.data)
        .where(eq(tickets.id, id))
        .returning();

      return reply.send({ ticket: updated });
    }
  );

  fastify.patch(
    "/tickets/:id/status",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateTicketStatusSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const ticket = await fastify.db.query.tickets.findFirst({
        where: eq(tickets.id, id),
      });

      if (!ticket) {
        return reply.status(404).send({ error: "Ticket not found" });
      }

      if (!canModifyTicket(request.user!, ticket)) {
        return reply.status(403).send({ error: "Access denied" });
      }

      const newStatus = parsed.data.status as TicketStatus;
      const currentStatus = ticket.status as TicketStatus;

      try {
        validateStatusTransition(currentStatus, newStatus);
      } catch {
        return reply.status(409).send({
          error: formatTransitionError(currentStatus, newStatus),
        });
      }

      const [updated] = await fastify.db
        .update(tickets)
        .set({ status: newStatus })
        .where(eq(tickets.id, id))
        .returning();

      return reply.send({ ticket: updated });
    }
  );

  fastify.get(
    "/tickets/:id/comments",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const ticket = await fastify.db.query.tickets.findFirst({
        where: eq(tickets.id, id),
      });

      if (!ticket) {
        return reply.status(404).send({ error: "Ticket not found" });
      }

      if (!canAccessTicket(request.user!, ticket)) {
        return reply.status(403).send({ error: "Access denied" });
      }

      const commentRows = await fastify.db
        .select({
          id: comments.id,
          ticketId: comments.ticketId,
          message: comments.message,
          createdAt: comments.createdAt,
          createdBy: comments.createdBy,
          authorName: users.name,
          authorUsername: users.username,
        })
        .from(comments)
        .innerJoin(users, eq(comments.createdBy, users.id))
        .where(eq(comments.ticketId, id))
        .orderBy(asc(comments.createdAt));

      return reply.send({ comments: commentRows });
    }
  );

  fastify.post(
    "/tickets/:id/comments",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = createCommentSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const ticket = await fastify.db.query.tickets.findFirst({
        where: eq(tickets.id, id),
      });

      if (!ticket) {
        return reply.status(404).send({ error: "Ticket not found" });
      }

      if (!canAccessTicket(request.user!, ticket)) {
        return reply.status(403).send({ error: "Access denied" });
      }

      const [comment] = await fastify.db
        .insert(comments)
        .values({
          ticketId: id,
          message: parsed.data.message,
          createdBy: request.user!.id,
        })
        .returning();

      return reply.status(201).send({ comment });
    }
  );
}
