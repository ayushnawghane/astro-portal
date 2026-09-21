export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: "USER" | "ASTROLOGER" | "ADMIN";
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export type ProfileRelation = "SELF" | "SPOUSE" | "CHILD" | "PARENT" | "CUSTOM";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Profile {
  id: string;
  userId: string;
  relation: ProfileRelation;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  createdAt: string;
}

export interface PlanetPosition {
  graha: string;
  longitude: number;
  rashi: string;
  degreeInRashi: number;
  nakshatra: string;
  nakshatraPada: number;
  house: number;
  isRetrograde: boolean;
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  years: number;
}

export interface DoshaResult {
  name: string;
  present: boolean;
  reason: string;
}

export interface KundliReport {
  id: string;
  profileId: string;
  chartData: {
    ascendant: { rashi: string; longitude: number; degreeInRashi: number };
    houses: { house: number; rashi: string }[];
    moonNakshatra: { name: string; pada: number };
  };
  planetaryPositions: PlanetPosition[];
  houseAnalysis: { house: number; rashi: string }[];
  dashaInfo: DashaPeriod[];
  doshas: DoshaResult[];
  createdAt: string;
}
