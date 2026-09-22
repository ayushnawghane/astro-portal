"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AdminUser, PaginatedResult } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Card } from "@/components/ui";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get<PaginatedResult<AdminUser>>("/admin/users?pageSize=50", token)
      .then((res) => setUsers(res.items))
      .finally(() => setLoadingList(false));
  }, [token]);

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Users</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        {loadingList ? (
          <p className="text-lg text-muted">Loading…</p>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-lg text-left">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4">Contact</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4">{u.email ?? u.phone}</td>
                      <td className="py-3 pr-4">{u.role}</td>
                      <td className="py-3 pr-4 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
