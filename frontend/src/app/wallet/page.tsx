"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { PaginatedResult, Wallet, WalletTransaction } from "@/lib/types";
import { Button, Card, ErrorText, Field, TextInput } from "@/components/ui";

const QUICK_AMOUNTS = [100, 250, 500, 1000];

const TXN_LABEL: Record<string, string> = {
  RECHARGE: "Recharge",
  DEBIT: "Consultation charge",
  REFUND: "Refund",
  PROMOTION: "Promotion",
};

export default function WalletPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [amount, setAmount] = useState("500");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  function refresh() {
    if (!token) return;
    api.get<Wallet>("/wallet/me", token).then(setWallet);
    api.get<PaginatedResult<WalletTransaction>>("/wallet/me/transactions", token).then((res) => setTransactions(res.items));
  }

  useEffect(refresh, [token]);

  async function handleRecharge(e: FormEvent) {
    e.preventDefault();
    setError("");
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post<Wallet>("/wallet/me/recharge", { amount: value }, token);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not process the recharge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">My Wallet</h1>

      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-base text-muted">Current balance</p>
          <p className="text-4xl font-semibold text-accent">₹{wallet ? Number(wallet.balance).toFixed(2) : "…"}</p>
        </div>
        <form onSubmit={handleRecharge} className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`rounded-lg border px-4 py-2 text-lg font-medium transition-colors ${
                  amount === String(a) ? "bg-accent text-white border-accent" : "border-border hover:bg-zinc-100"
                }`}
              >
                ₹{a}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-end">
            <div className="w-40">
              <Field label="Amount (₹)" htmlFor="amount">
                <TextInput id="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add money"}
            </Button>
          </div>
        </form>
      </Card>
      <ErrorText>{error}</ErrorText>

      <Card>
        <h2 className="text-2xl font-semibold mb-4">Transaction history</h2>
        {transactions.length === 0 ? (
          <p className="text-lg text-muted">No transactions yet.</p>
        ) : (
          <ul className="flex flex-col">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-lg font-medium">{TXN_LABEL[t.type] ?? t.type}</p>
                  <p className="text-base text-muted">{t.description}</p>
                  <p className="text-sm text-muted">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <p className={`text-xl font-semibold ${t.type === "DEBIT" ? "text-accent" : "text-green-700"}`}>
                  {t.type === "DEBIT" ? "−" : "+"}₹{Number(t.amount).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
