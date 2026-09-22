"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ChatMessage, Consultation } from "@/lib/types";
import { Button, Card, ErrorText } from "@/components/ui";
import { VoiceCall } from "@/components/voice-call";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000/consultations";

export default function ConsultationRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const refreshConsultation = useCallback(() => {
    if (!token) return;
    api.get<Consultation>(`/consultations/${id}`, token).then(setConsultation);
  }, [id, token]);

  useEffect(refreshConsultation, [refreshConsultation]);

  // Poll for status changes (e.g. astrologer accepting) while waiting.
  useEffect(() => {
    if (!consultation || consultation.status !== "PENDING") return;
    const interval = setInterval(refreshConsultation, 3000);
    return () => clearInterval(interval);
  }, [consultation, refreshConsultation]);

  // Load message history once active, and connect the live socket.
  useEffect(() => {
    if (!token || !consultation || consultation.status === "PENDING") return;

    api.get<ChatMessage[]>(`/consultations/${id}/messages`, token).then(setMessages);

    if (consultation.status !== "ACTIVE") return;

    const socket = io(WS_URL, { auth: { token } });
    socketRef.current = socket;
    socket.emit("joinConsultation", { consultationId: id });
    socket.on("newMessage", (message: ChatMessage) => setMessages((prev) => [...prev, message]));
    socket.on("error", (err: { message: string }) => setError(err.message));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, id, consultation?.status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { consultationId: id, content: draft.trim() });
    setDraft("");
  }

  async function handleAction(action: "accept" | "reject" | "cancel" | "end") {
    setError("");
    setActing(true);
    try {
      await api.post(`/consultations/${id}/${action}`, undefined, token);
      refreshConsultation();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action could not be completed.");
    } finally {
      setActing(false);
    }
  }

  if (loading || !user || !consultation) return null;

  const isAstrologerParty = consultation.astrologer?.userId === user.id;
  const otherPartyName = isAstrologerParty
    ? (consultation.user?.email ?? consultation.user?.phone ?? "Client")
    : (consultation.astrologer?.displayName ?? "Astrologer");

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/consultations" className="text-lg text-accent hover:underline">
          ← My consultations
        </Link>
        {consultation.status === "ACTIVE" && (
          <Button variant="secondary" onClick={() => handleAction("end")} disabled={acting}>
            End consultation
          </Button>
        )}
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold">{otherPartyName}</p>
          <p className="text-base text-muted">
            {consultation.type === "CHAT" ? "Chat" : "Voice"} consultation
            {consultation.isFreeSession ? " · Free session" : ""}
          </p>
        </div>
        <StatusBadge status={consultation.status} />
      </Card>

      <ErrorText>{error}</ErrorText>

      {consultation.status === "PENDING" && isAstrologerParty && (
        <Card className="flex items-center justify-between gap-4">
          <p className="text-lg">New consultation request.</p>
          <div className="flex gap-3">
            <Button onClick={() => handleAction("accept")} disabled={acting}>
              Accept
            </Button>
            <Button variant="secondary" onClick={() => handleAction("reject")} disabled={acting}>
              Decline
            </Button>
          </div>
        </Card>
      )}

      {consultation.status === "PENDING" && !isAstrologerParty && (
        <Card className="flex items-center justify-between gap-4">
          <p className="text-lg text-muted">Waiting for the astrologer to accept your request…</p>
          <Button variant="secondary" onClick={() => handleAction("cancel")} disabled={acting}>
            Cancel request
          </Button>
        </Card>
      )}

      {consultation.status === "ACTIVE" && consultation.type === "VOICE" && (
        <Card>
          <VoiceCall
            consultationId={id}
            token={token}
            isCaller={!isAstrologerParty}
            onEnded={() => handleAction("end")}
          />
        </Card>
      )}

      {(consultation.status === "ACTIVE" || consultation.status === "COMPLETED") && (
        <Card className="flex flex-col gap-4">
          <div className="h-96 overflow-y-auto flex flex-col gap-3 pr-2">
            {messages.length === 0 ? (
              <p className="text-lg text-muted text-center my-auto">
                {consultation.status === "ACTIVE" ? "Say hello to start the conversation." : "No messages were sent."}
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-lg ${
                    m.senderId === user.id ? "self-end bg-accent text-white" : "self-start bg-zinc-100"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {consultation.status === "ACTIVE" && (
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 rounded-lg border border-border px-4 py-3 text-lg focus:border-accent"
              />
              <Button type="submit">Send</Button>
            </form>
          )}
        </Card>
      )}

      {consultation.status === "COMPLETED" && !isAstrologerParty && <ReviewForm consultationId={id} token={token} />}
    </div>
  );
}

function StatusBadge({ status }: { status: Consultation["status"] }) {
  const styles: Record<string, string> = {
    PENDING: "bg-gold/10 text-gold",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-zinc-100 text-muted",
    CANCELLED: "bg-zinc-100 text-muted",
  };
  return <span className={`rounded-full px-4 py-2 text-base font-semibold ${styles[status]}`}>{status}</span>;
}

function ReviewForm({ consultationId, token }: { consultationId: string; token: string | null }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/consultations/${consultationId}/review`, { rating, comment: comment || undefined }, token);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your review.");
    }
  }

  if (submitted) {
    return (
      <Card>
        <p className="text-lg text-muted">Thank you for your review!</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Rate this consultation</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={`text-3xl ${n <= rating ? "text-gold" : "text-zinc-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          className="rounded-lg border border-border px-4 py-3 text-lg focus:border-accent"
          rows={3}
        />
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="self-start">
          Submit review
        </Button>
      </form>
    </Card>
  );
}
