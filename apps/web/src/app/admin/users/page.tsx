"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type User, ApiClientError } from "@/lib/api";
import { ErrorAlert } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.push("/tickets");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      api
        .getUsers()
        .then((data) => setUsers(data.users))
        .catch((err) =>
          setError(err instanceof ApiClientError ? err.message : "Failed to load users")
        )
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleRoleChange = async (userId: string, role: string) => {
    setError("");
    try {
      const { user: updated } = await api.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update role");
    }
  };

  if (authLoading || loading) {
    return <div className="py-12 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Username</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === user?.id}
                    className="rounded-md border border-[var(--border)] px-2 py-1"
                  >
                    <option value="admin">admin</option>
                    <option value="agent">agent</option>
                    <option value="user">user</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
