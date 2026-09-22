import type { Graha, VimshottariLord } from './astrology.constants.js';

export interface PlanetPosition {
  graha: Graha;
  longitude: number; // sidereal, 0-360
  rashi: string; // zodiac sign
  degreeInRashi: number; // 0-30
  nakshatra: string;
  nakshatraPada: number; // 1-4
  house: number; // 1-12, whole-sign from Lagna
  isRetrograde: boolean;
}

export interface AscendantInfo {
  longitude: number;
  rashi: string;
  degreeInRashi: number;
}

export interface DashaPeriod {
  lord: VimshottariLord;
  startDate: string; // ISO date
  endDate: string; // ISO date
  years: number;
}

export interface DoshaResult {
  name: string;
  present: boolean;
  reason: string;
}

export type YogaResult = DoshaResult;

export interface BirthChartResult {
  julianDayUT: number;
  ascendant: AscendantInfo;
  planets: PlanetPosition[];
  houses: { house: number; rashi: string }[];
  moonNakshatra: { name: string; pada: number };
  dashas: DashaPeriod[];
  doshas: DoshaResult[];
  yogas: YogaResult[];
}
