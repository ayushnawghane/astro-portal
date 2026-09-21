"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Gender, Profile, ProfileRelation } from "@/lib/types";
import { Button, Card, ErrorText, Field, Select, TextInput } from "@/components/ui";

const RELATIONS: { value: ProfileRelation; label: string }[] = [
  { value: "SELF", label: "Myself" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "CHILD", label: "Child" },
  { value: "PARENT", label: "Parent" },
  { value: "CUSTOM", label: "Someone else" },
];

export default function ProfilesPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .get<Profile[]>("/profiles", token)
      .then(setProfiles)
      .finally(() => setLoadingProfiles(false));
  }, [token]);

  if (loading || !user) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">My Profiles</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add a profile"}</Button>
      </div>

      {showForm && (
        <CreateProfileForm
          token={token!}
          onCreated={(p) => {
            setProfiles((prev) => [...prev, p]);
            setShowForm(false);
          }}
        />
      )}

      {loadingProfiles ? (
        <p className="text-lg text-muted">Loading your profiles…</p>
      ) : profiles.length === 0 ? (
        <Card>
          <p className="text-lg text-muted">
            You haven&apos;t added any profiles yet. Add one to generate a free birth chart (Kundli).
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {profiles.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div>
                <p className="text-xl font-semibold">{p.name}</p>
                <p className="text-base text-muted">{RELATIONS.find((r) => r.value === p.relation)?.label}</p>
              </div>
              <dl className="text-lg grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-muted">Born</dt>
                <dd>
                  {new Date(p.dateOfBirth).toLocaleDateString()} at {p.timeOfBirth}
                </dd>
                <dt className="text-muted">Place</dt>
                <dd>{p.placeOfBirth}</dd>
              </dl>
              <Link
                href={`/profiles/${p.id}/kundli`}
                className="mt-2 inline-block rounded-lg bg-accent px-5 py-3 text-center text-lg font-semibold text-white hover:bg-accent-hover transition-colors"
              >
                View Kundli
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProfileForm({ token, onCreated }: { token: string; onCreated: (p: Profile) => void }) {
  const [relation, setRelation] = useState<ProfileRelation>("SELF");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const profile = await api.post<Profile>(
        "/profiles",
        {
          relation,
          name,
          gender,
          dateOfBirth,
          timeOfBirth,
          placeOfBirth,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          timezone: "Asia/Kolkata",
        },
        token,
      );
      onCreated(profile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this profile. Please check the details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
        <Field label="This profile is for" htmlFor="relation">
          <Select id="relation" value={relation} onChange={(e) => setRelation(e.target.value as ProfileRelation)}>
            {RELATIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Full name" htmlFor="name">
          <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>
        <Field label="Date of birth" htmlFor="dob">
          <TextInput id="dob" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </Field>
        <Field label="Time of birth" htmlFor="tob" hint="As close to exact as you know — this affects chart accuracy.">
          <TextInput id="tob" type="time" required value={timeOfBirth} onChange={(e) => setTimeOfBirth(e.target.value)} />
        </Field>
        <Field label="Place of birth" htmlFor="pob">
          <TextInput
            id="pob"
            required
            placeholder="e.g. Mumbai, Maharashtra"
            value={placeOfBirth}
            onChange={(e) => setPlaceOfBirth(e.target.value)}
          />
        </Field>
        <Field label="Latitude" htmlFor="lat" hint="Needed for an accurate chart — search '[city] latitude longitude'.">
          <TextInput id="lat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </Field>
        <Field label="Longitude" htmlFor="lng">
          <TextInput id="lng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </Field>
        <div className="sm:col-span-2 flex flex-col gap-4">
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
