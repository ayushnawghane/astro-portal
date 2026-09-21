import { ZODIAC_SIGNS } from '../../common/zodiac-signs.js';

export const RASHIS = ZODIAC_SIGNS;

export const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const;

export const NAKSHATRA_SPAN_DEG = 360 / 27; // 13°20'

/**
 * Vimshottari Dasha lord cycle, in order, repeating every 9 nakshatras.
 * Index 0 (Ashwini) starts with Ketu, per classical assignment.
 */
export const VIMSHOTTARI_LORD_SEQUENCE = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
] as const;

export type VimshottariLord = (typeof VIMSHOTTARI_LORD_SEQUENCE)[number];

/** Total Mahadasha length per lord, in years. Sums to 120 (the full Vimshottari cycle). */
export const VIMSHOTTARI_PERIOD_YEARS: Record<VimshottariLord, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
export type Graha = (typeof GRAHAS)[number];
