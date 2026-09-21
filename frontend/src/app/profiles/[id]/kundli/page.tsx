"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api, API_URL } from "@/lib/api";
import type { KundliReport } from "@/lib/types";
import { Button, Card, ErrorText } from "@/components/ui";

export default function KundliPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<KundliReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .get<KundliReport[]>(`/kundli/profiles/${id}`, token)
      .then(setReports)
      .finally(() => setLoadingReports(false));
  }, [token, id]);

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    try {
      const report = await api.post<KundliReport>(`/kundli/profiles/${id}/generate`, undefined, token);
      setReports((prev) => [report, ...prev]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not generate this chart. Make sure the profile has latitude and longitude set.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPdf(reportId: string) {
    const res = await fetch(`${API_URL}/kundli/${reportId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("Could not download the PDF. Please try again.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kundli-${reportId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !user) return null;

  const latest = reports[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Free Kundli</h1>
        <Link href="/profiles" className="text-lg text-accent hover:underline">
          ← Back to profiles
        </Link>
      </div>

      <ErrorText>{error}</ErrorText>

      {loadingReports ? (
        <p className="text-lg text-muted">Loading…</p>
      ) : !latest ? (
        <Card className="flex flex-col items-center gap-6 text-center">
          <p className="text-lg text-muted">No chart generated yet for this profile.</p>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Calculating your chart…" : "Generate my Kundli"}
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-semibold">
                Ascendant (Lagna): <span className="capitalize">{latest.chartData.ascendant.rashi}</span>
              </p>
              <p className="text-lg text-muted">
                Moon Nakshatra: {latest.chartData.moonNakshatra.name}, Pada {latest.chartData.moonNakshatra.pada}
              </p>
            </div>
            <Button variant="secondary" onClick={() => handleDownloadPdf(latest.id)}>
              Download PDF
            </Button>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Planetary Positions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-lg text-left">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4">Planet</th>
                    <th className="py-2 pr-4">Sign</th>
                    <th className="py-2 pr-4">Degree</th>
                    <th className="py-2 pr-4">House</th>
                    <th className="py-2 pr-4">Nakshatra</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.planetaryPositions.map((p) => (
                    <tr key={p.graha} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 font-medium">
                        {p.graha}
                        {p.isRetrograde ? <span className="text-muted"> (R)</span> : ""}
                      </td>
                      <td className="py-2 pr-4 capitalize">{p.rashi}</td>
                      <td className="py-2 pr-4">{p.degreeInRashi.toFixed(1)}°</td>
                      <td className="py-2 pr-4">{p.house}</td>
                      <td className="py-2 pr-4">
                        {p.nakshatra} (Pada {p.nakshatraPada})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Vimshottari Dasha (major periods)</h2>
            <ul className="text-lg flex flex-col gap-2">
              {latest.dashaInfo.map((d, i) => (
                <li key={i} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span className="font-medium">{d.lord}</span>
                  <span className="text-muted">
                    {d.startDate} → {d.endDate} ({d.years} yrs)
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Dosha Check</h2>
            <ul className="text-lg flex flex-col gap-3">
              {latest.doshas.map((d) => (
                <li key={d.name}>
                  <span className={`font-semibold ${d.present ? "text-accent" : "text-muted"}`}>
                    {d.name}: {d.present ? "Present" : "Not present"}
                  </span>
                  <p className="text-base text-muted">{d.reason}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
