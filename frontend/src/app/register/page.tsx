"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Card, Field, TextInput, Button, ErrorText } from "@/components/ui";
import { PhoneOtpForm } from "@/components/phone-otp-form";

export default function RegisterPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-8">Create your account</h1>
      <Card>
        <div className="flex gap-3 mb-6">
          <MethodTab active={method === "email"} onClick={() => setMethod("email")}>
            Email
          </MethodTab>
          <MethodTab active={method === "phone"} onClick={() => setMethod("phone")}>
            Mobile number
          </MethodTab>
        </div>
        {method === "email" ? <EmailRegisterForm /> : <PhoneOtpForm purpose="REGISTER" />}
      </Card>
      <p className="text-center text-lg text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function MethodTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2 text-lg font-medium border transition-colors ${
        active ? "bg-accent text-white border-accent" : "border-border hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function EmailRegisterForm() {
  const { registerWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await registerWithEmail(email, password);
      router.push("/profiles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field label="Email address" htmlFor="email">
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <TextInput
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
