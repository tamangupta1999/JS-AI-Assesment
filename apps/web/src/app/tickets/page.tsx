"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { api, type Ticket, type User, ApiClientError } from "@/lib/api";
import { ErrorAlert, PriorityBadge, StatusBadge } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

function TicketsList() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const assignedTo = searchParams.get("assignedTo") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.getTickets({
          q: q || undefined,
          status: status || undefined,
          priority: priority || undefined,
          assignedTo: assignedTo || undefined,
          sort,
          order,
          page,
        });
        setTickets(data.tickets);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [q, status, priority, assignedTo, sort, order, page]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "agent") {
      api.getUsers().then((data) => {
        setAgents(data.users.filter((u) => u.role === "agent" || u.role === "admin"));
      }).catch(() => {});
    }
  }, [user]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.delete("page");
    router.push(`/tickets?${params.toString()}`);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilter("q", formData.get("q") as string);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Link
          href="/tickets/new"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white hover:bg-[var(--primary-hover)]"
        >
          New Ticket
        </Link>
      </div>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      <div className="mb-6 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search tickets..."
            className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {["open", "in_progress", "resolved", "closed", "cancelled"].map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => updateFilter("priority", e.target.value)}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="">All priorities</option>
            {["low", "medium", "high", "urgent"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(user?.role === "admin" || user?.role === "agent") && (
            <select
              value={assignedTo}
              onChange={(e) => updateFilter("assignedTo", e.target.value)}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">All assignees</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
          <select
            value={`${sort}-${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split("-");
              const params = new URLSearchParams(searchParams.toString());
              params.set("sort", s);
              params.set("order", o);
              router.push(`/tickets?${params.toString()}`);
            }}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="priority-desc">Priority high to low</option>
            <option value="status-asc">Status A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No tickets found</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{ticket.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {ticket.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    By {ticket.creatorName ?? "Unknown"}
                    {ticket.assigneeName && ` · Assigned to ${ticket.assigneeName}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateFilter("page", String(page - 1))}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => updateFilter("page", String(page + 1))}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketsList />
    </Suspense>
  );
}
