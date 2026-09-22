"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AdminWalletTransaction, PaginatedResult } from "@/lib/types";
import { AdminGuard } from "@/components/admin-guard";
import { Card } from "@/components/ui";

const TXN_LABEL: Record<string, string> = {
  RECHARGE: "Recharge",
  DEBIT: "Consultation charge",
  REFUND: "Refund",
  PROMOTION: "Promotion",
};

export default function AdminWalletPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<AdminWalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get<PaginatedResult<AdminWalletTransaction>>("/admin/wallet/transactions?pageSize=50", token)
      .then((res) => setTransactions(res.items))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Wallet Transactions</h1>
          <Link href="/admin" className="text-lg text-accent hover:underline">
            ← Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-lg text-muted">Loading…</p>
        ) : (
          <Card>
            <ul className="flex flex-col">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-lg font-medium">
                      {TXN_LABEL[t.type] ?? t.type} — {t.wallet.user.email ?? t.wallet.user.phone}
                    </p>
                    <p className="text-base text-muted">{t.description}</p>
                    <p className="text-sm text-muted">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                  <p className={`text-xl font-semibold ${t.type === "DEBIT" ? "text-accent" : "text-green-700"}`}>
                    {t.type === "DEBIT" ? "−" : "+"}₹{Number(t.amount).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
