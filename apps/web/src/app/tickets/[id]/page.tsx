"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getValidNextStatuses } from "@repo/shared";
import {
  api,
  type Comment,
  type Ticket,
  type User,
  ApiClientError,
} from "@/lib/api";
import {
  ErrorAlert,
  FieldError,
  PriorityBadge,
  StatusBadge,
  TICKET_PRIORITIES,
} from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, commentsData] = await Promise.all([
        api.getTicket(id),
        api.getComments(id),
      ]);
      setTicket(ticketData.ticket);
      setComments(commentsData.comments);
      setEditForm({
        title: ticketData.ticket.title,
        description: ticketData.ticket.description,
        priority: ticketData.ticket.priority,
        assignedTo: ticketData.ticket.assignedTo ?? "",
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "agent") {
      api.getUsers().then((data) => {
        setAgents(data.users.filter((u) => u.role === "agent" || u.role === "admin"));
      }).catch(() => {});
    }
  }, [user]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusError("");
    try {
      const { ticket: updated } = await api.updateTicketStatus(id, newStatus);
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setStatusError(
        err instanceof ApiClientError ? err.message : "Status update failed"
      );
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      const { ticket: updated } = await api.updateTicket(id, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        assignedTo: editForm.assignedTo || null,
      });
      setTicket((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditMode(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        setFieldErrors(err.details);
      }
      setError(err instanceof ApiClientError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.addComment(id, commentText);
      setCommentText("");
      const { comments: updated } = await api.getComments(id);
      setComments(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to add comment");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading ticket...</div>;
  }

  if (!ticket) {
    return (
      <div>
        <ErrorAlert message={error || "Ticket not found"} />
        <Link href="/tickets" className="mt-4 inline-block text-[var(--primary)]">
          Back to tickets
        </Link>
      </div>
    );
  }

  const validNextStatuses = getValidNextStatuses(ticket.status);

  return (
    <div>
      <Link href="/tickets" className="mb-4 inline-block text-sm text-[var(--primary)]">
        ← Back to tickets
      </Link>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {editMode ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full text-xl font-bold"
              />
            ) : (
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
            )}
            <p className="mt-2 text-sm text-slate-500">
              Created by {ticket.creator?.name ?? ticket.creatorName ?? "Unknown"}
              {ticket.assignee && ` · Assigned to ${ticket.assignee.name}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={5}
                className="w-full rounded-md border border-[var(--border)] px-3 py-2"
              />
              <FieldError errors={fieldErrors.description} />
            </div>
            <div className="flex gap-4">
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="rounded-md border border-[var(--border)] px-3 py-2"
              >
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {agents.length > 0 && (
                <select
                  value={editForm.assignedTo}
                  onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                  className="rounded-md border border-[var(--border)] px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-slate-700">{ticket.description}</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Edit
            </button>
          </>
        )}

        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <h2 className="mb-3 font-semibold">Change Status</h2>
          {statusError && <div className="mb-3"><ErrorAlert message={statusError} /></div>}
          {validNextStatuses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {validNextStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm capitalize hover:bg-slate-50"
                >
                  → {status.replace("_", " ")}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No further status transitions available (terminal state).
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 font-semibold">Comments ({comments.length})</h2>
        <div className="mb-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-md bg-slate-50 p-3">
                <p className="text-sm">{comment.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {comment.authorName ?? "Unknown"} ·{" "}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
