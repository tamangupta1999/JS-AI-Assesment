const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("accessToken", token);
    } else {
      sessionStorage.removeItem("accessToken");
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("accessToken");
  }
  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      (data as ApiError).error ?? "Request failed",
      (data as ApiError).details
    );
  }

  return data as T;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "admin" | "agent" | "user";
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed" | "cancelled";
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assigneeName?: string | null;
  creatorName?: string | null;
  assignee?: { id: string; name: string; username: string } | null;
  creator?: { id: string; name: string; username: string } | null;
}

export interface Comment {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  createdBy: string;
  authorName?: string;
  authorUsername?: string;
}

export const api = {
  register: (data: {
    username: string;
    email: string;
    name: string;
    password: string;
  }) =>
    request<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) =>
    request<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: () =>
    request<{ accessToken: string; user: User }>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User }>("/auth/me"),

  getTickets: (params: Record<string, string | number | undefined> = {}) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }
    const query = searchParams.toString();
    return request<{
      tickets: Ticket[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/tickets${query ? `?${query}` : ""}`);
  },

  getTicket: (id: string) =>
    request<{ ticket: Ticket }>(`/tickets/${id}`),

  createTicket: (data: {
    title: string;
    description: string;
    priority?: string;
    assignedTo?: string | null;
  }) =>
    request<{ ticket: Ticket }>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTicket: (
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: string;
      assignedTo?: string | null;
    }
  ) =>
    request<{ ticket: Ticket }>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateTicketStatus: (id: string, status: string) =>
    request<{ ticket: Ticket }>(`/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getComments: (ticketId: string) =>
    request<{ comments: Comment[] }>(`/tickets/${ticketId}/comments`),

  addComment: (ticketId: string, message: string) =>
    request<{ comment: Comment }>(`/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  getUsers: () => request<{ users: User[] }>("/users"),

  updateUserRole: (id: string, role: string) =>
    request<{ user: User }>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};
