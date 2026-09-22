"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  if (user.role !== "ADMIN") {
    return (
      <Card>
        <p className="text-lg text-muted">You don&apos;t have access to the admin panel.</p>
      </Card>
    );
  }

  return <>{children}</>;
}
