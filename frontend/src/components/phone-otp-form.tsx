"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Button, ErrorText, Field, TextInput } from "@/components/ui";

export function PhoneOtpForm({ purpose }: { purpose: "REGISTER" | "LOGIN" }) {
  const { requestPhoneOtp, verifyPhoneOtp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPhoneOtp(phone, purpose);
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send a code to this number. Please check it and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifyPhoneOtp(phone, code);
      router.push("/profiles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code didn't work. Please check it and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendCode} className="flex flex-col gap-6">
        <Field label="Mobile number" htmlFor="phone" hint="Include your country code, e.g. +91 98765 43210.">
          <TextInput
            id="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending code…" : "Send OTP"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-6">
      <p className="text-lg text-muted">A 6-digit code was sent to {phone}.</p>
      <Field label="Enter the code" htmlFor="code">
        <TextInput
          id="code"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Verifying…" : "Verify & continue"}
      </Button>
      <button type="button" onClick={() => setStep("phone")} className="text-lg text-accent hover:underline self-start">
        Use a different number
      </button>
    </form>
  );
}
