"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000/consultations";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

type CallStatus = "connecting" | "ringing" | "connected" | "ended" | "failed";

export function VoiceCall({
  consultationId,
  token,
  isCaller,
  onEnded,
}: {
  consultationId: string;
  token: string | null;
  isCaller: boolean;
  onEnded: () => void;
}) {
  const [status, setStatus] = useState<CallStatus>("connecting");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      let socket: Socket;
      let pc: RTCPeerConnection;
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = localStream;

        pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
          setStatus("connected");
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
            setStatus("failed");
          }
        };

        socket = io(WS_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("joinConsultation", { consultationId });
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("voice:ice-candidate", { consultationId, candidate: event.candidate });
          }
        };

        socket.on("voice:ice-candidate", async (body: { candidate: RTCIceCandidateInit }) => {
          try {
            await pc.addIceCandidate(body.candidate);
          } catch {
            // Candidate can arrive before the remote description is set; safe to ignore.
          }
        });

        socket.on("voice:offer", async (body: { sdp: RTCSessionDescriptionInit }) => {
          await pc.setRemoteDescription(body.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("voice:answer", { consultationId, sdp: answer });
        });

        socket.on("voice:answer", async (body: { sdp: RTCSessionDescriptionInit }) => {
          await pc.setRemoteDescription(body.sdp);
        });

        socket.on("voice:hangup", () => {
          setStatus("ended");
          cleanup();
        });

        socket.on("error", (body: { message: string }) => setError(body.message));

        if (isCaller) {
          setStatus("ringing");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("voice:offer", { consultationId, sdp: offer });
        } else {
          setStatus("ringing");
        }
      } catch {
        setError("Could not access your microphone. Please allow microphone access and try again.");
        setStatus("failed");
      }
    }

    function cleanup() {
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
    }

    start();
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, isCaller]);

  function toggleMute() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  }

  function handleHangup() {
    socketRef.current?.emit("voice:hangup", { consultationId });
    setStatus("ended");
    onEnded();
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <audio ref={remoteAudioRef} autoPlay />
      <p className="text-2xl font-semibold">
        {status === "connecting" && "Setting up call…"}
        {status === "ringing" && "Connecting…"}
        {status === "connected" && "Call in progress"}
        {status === "ended" && "Call ended"}
        {status === "failed" && "Call failed"}
      </p>
      {error && <p className="text-lg text-accent">{error}</p>}
      {(status === "connected" || status === "ringing") && (
        <div className="flex gap-4">
          <Button variant="secondary" onClick={toggleMute}>
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button onClick={handleHangup}>Hang up</Button>
        </div>
      )}
    </div>
  );
}
