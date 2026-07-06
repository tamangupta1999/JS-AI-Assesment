import bcrypt from "bcrypt";
import { config } from "dotenv";
import { createDb } from "./index.js";
import { users, tickets, comments } from "./schema/index.js";
import path from "node:path";

config({ path: path.resolve(process.cwd(), "../../.env") });

const DEV_PASSWORD = "Password123!";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const { db, client } = createDb(connectionString);
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  const seedUsers = [
    {
      username: "admin",
      email: "admin@example.com",
      name: "Admin User",
      passwordHash,
      role: "admin" as const,
    },
    {
      username: "agent1",
      email: "agent1@example.com",
      name: "Agent One",
      passwordHash,
      role: "agent" as const,
    },
    {
      username: "agent2",
      email: "agent2@example.com",
      name: "Agent Two",
      passwordHash,
      role: "agent" as const,
    },
    {
      username: "user1",
      email: "user1@example.com",
      name: "Regular User",
      passwordHash,
      role: "user" as const,
    },
    {
      username: "user2",
      email: "user2@example.com",
      name: "Another User",
      passwordHash,
      role: "user" as const,
    },
  ];

  const insertedUsers = await db
    .insert(users)
    .values(seedUsers)
    .onConflictDoNothing()
    .returning();

  const allUsers =
    insertedUsers.length > 0
      ? insertedUsers
      : await db.select().from(users);

  const admin = allUsers.find((u) => u.username === "admin")!;
  const agent1 = allUsers.find((u) => u.username === "agent1")!;
  const agent2 = allUsers.find((u) => u.username === "agent2")!;
  const user1 = allUsers.find((u) => u.username === "user1")!;
  const user2 = allUsers.find((u) => u.username === "user2")!;

  const seedTickets = [
    {
      title: "Cannot login to dashboard",
      description: "User reports 500 error when accessing the main dashboard after login.",
      priority: "high" as const,
      status: "open" as const,
      assignedTo: agent1.id,
      createdBy: user1.id,
    },
    {
      title: "Email notifications not sending",
      description: "Password reset emails are not being delivered to users.",
      priority: "urgent" as const,
      status: "in_progress" as const,
      assignedTo: agent1.id,
      createdBy: user2.id,
    },
    {
      title: "Feature request: dark mode",
      description: "Multiple users have requested a dark mode option for the application.",
      priority: "low" as const,
      status: "open" as const,
      assignedTo: null,
      createdBy: user1.id,
    },
    {
      title: "Database connection timeout",
      description: "Production database connections timing out during peak hours.",
      priority: "urgent" as const,
      status: "resolved" as const,
      assignedTo: agent2.id,
      createdBy: admin.id,
    },
    {
      title: "Mobile layout broken on iOS",
      description: "Navigation menu overlaps content on iPhone 15 Safari.",
      priority: "medium" as const,
      status: "in_progress" as const,
      assignedTo: agent2.id,
      createdBy: user2.id,
    },
    {
      title: "API rate limiting needed",
      description: "Public API endpoints need rate limiting to prevent abuse.",
      priority: "medium" as const,
      status: "closed" as const,
      assignedTo: agent1.id,
      createdBy: admin.id,
    },
    {
      title: "Outdated documentation",
      description: "Setup guide references deprecated configuration options.",
      priority: "low" as const,
      status: "cancelled" as const,
      assignedTo: null,
      createdBy: user1.id,
    },
    {
      title: "Export CSV feature broken",
      description: "CSV export generates empty files for reports over 1000 rows.",
      priority: "high" as const,
      status: "open" as const,
      assignedTo: agent1.id,
      createdBy: user2.id,
    },
  ];

  const insertedTickets = await db
    .insert(tickets)
    .values(seedTickets)
    .onConflictDoNothing()
    .returning();

  const allTickets =
    insertedTickets.length > 0
      ? insertedTickets
      : await db.select().from(tickets);

  if (allTickets.length > 0) {
    const ticket1 = allTickets[0];
    const ticket2 = allTickets[1];

    await db
      .insert(comments)
      .values([
        {
          ticketId: ticket1.id,
          message: "I can reproduce this issue. Investigating now.",
          createdBy: agent1.id,
        },
        {
          ticketId: ticket1.id,
          message: "Thanks for the quick response!",
          createdBy: user1.id,
        },
        {
          ticketId: ticket2.id,
          message: "Checked SMTP settings, found misconfigured port.",
          createdBy: agent1.id,
        },
      ])
      .onConflictDoNothing();
  }

  await client.end();
  console.log("Seed completed successfully");
  console.log(`Dev password for all users: ${DEV_PASSWORD}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
