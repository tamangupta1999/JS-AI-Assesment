"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, type User, ApiClientError } from "@/lib/api";
import { ErrorAlert, FieldError, TICKET_PRIORITIES } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

export default function NewTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [agents, setAgents] = useState<User[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "agent") {
      api.getUsers().then((data) => {
        setAgents(data.users.filter((u) => u.role === "agent" || u.role === "admin"));
      }).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const { ticket } = await api.createTicket({
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
      });
      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.details) setFieldErrors(err.details);
      } else {
        setError("Failed to create ticket");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Create Ticket</h1>
      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            required
          />
          <FieldError errors={fieldErrors.title} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            required
          />
          <FieldError errors={fieldErrors.description} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
          >
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {(user?.role === "admin" || user?.role === "agent") && agents.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium">Assign to</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-[var(--border)] px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
