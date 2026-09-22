/**
 * Reference data for classical Ashtakoot (Guna Milan) compatibility scoring.
 * Nakshatra -> Gana/Yoni/Nadi mappings are standard across Vedic astrology
 * texts. Vashya grouping uses a common simplified 4-group model — regional
 * traditions vary here, so treat Vashya specifically as approximate.
 */

export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Nadi = 'Aadi' | 'Madhya' | 'Antya';
export type Yoni =
  | 'Horse'
  | 'Elephant'
  | 'Sheep'
  | 'Serpent'
  | 'Dog'
  | 'Cat'
  | 'Rat'
  | 'Cow'
  | 'Buffalo'
  | 'Tiger'
  | 'Deer'
  | 'Monkey'
  | 'Mongoose'
  | 'Lion';

// Indexed 0-26, same order as NAKSHATRAS in kundli/astrology/astrology.constants.ts
export const NAKSHATRA_GANA: Gana[] = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva',
];

export const NAKSHATRA_YONI: Yoni[] = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog', 'Cat', 'Sheep', 'Cat',
  'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
  'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant',
];

export const NAKSHATRA_NADI: Nadi[] = [
  'Aadi', 'Antya', 'Madhya', 'Antya', 'Madhya', 'Aadi', 'Aadi', 'Madhya', 'Antya',
  'Antya', 'Madhya', 'Aadi', 'Aadi', 'Madhya', 'Madhya', 'Antya', 'Antya', 'Madhya',
  'Aadi', 'Aadi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Aadi', 'Aadi', 'Madhya',
];

const YONI_ENEMY_PAIRS: [Yoni, Yoni][] = [
  ['Cow', 'Tiger'],
  ['Elephant', 'Lion'],
  ['Horse', 'Buffalo'],
  ['Dog', 'Deer'],
  ['Sheep', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Rat', 'Cat'],
];

export function yoniScore(a: Yoni, b: Yoni): number {
  if (a === b) return 4;
  const isEnemy = YONI_ENEMY_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return isEnemy ? 0 : 2;
}

export function ganaScore(a: Gana, b: Gana): number {
  if (a === b) return 6;
  if ((a === 'Deva' && b === 'Manushya') || (a === 'Manushya' && b === 'Deva')) return 6;
  if ((a === 'Deva' && b === 'Rakshasa') || (a === 'Rakshasa' && b === 'Deva')) return 0;
  return 1; // Manushya-Rakshasa: generally considered discordant but not zero across all sources.
}

// Sign indices 0=Aries..11=Pisces, same order as RASHIS.
export const RASHI_VARNA = ['Kshatriya', 'Vaishya', 'Shudra', 'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin'] as const;
const VARNA_RANK: Record<string, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };

export function varnaScore(groomSignIndex: number, brideSignIndex: number): number {
  const groom = VARNA_RANK[RASHI_VARNA[groomSignIndex]];
  const bride = VARNA_RANK[RASHI_VARNA[brideSignIndex]];
  return groom >= bride ? 1 : 0;
}

type VashyaGroup = 'Chatushpad' | 'Manav' | 'Jalchar' | 'Vanchar';
const RASHI_VASHYA: VashyaGroup[] = ['Chatushpad', 'Chatushpad', 'Manav', 'Jalchar', 'Chatushpad', 'Manav', 'Manav', 'Vanchar', 'Chatushpad', 'Chatushpad', 'Manav', 'Jalchar'];
const VASHYA_MATRIX: Record<VashyaGroup, Record<VashyaGroup, number>> = {
  Chatushpad: { Chatushpad: 2, Manav: 1, Jalchar: 1, Vanchar: 0 },
  Manav: { Chatushpad: 1, Manav: 2, Jalchar: 1, Vanchar: 0 },
  Jalchar: { Chatushpad: 1, Manav: 1, Jalchar: 2, Vanchar: 1 },
  Vanchar: { Chatushpad: 0, Manav: 0, Jalchar: 1, Vanchar: 2 },
};

export function vashyaScore(groomSignIndex: number, brideSignIndex: number): number {
  return VASHYA_MATRIX[RASHI_VASHYA[groomSignIndex]][RASHI_VASHYA[brideSignIndex]];
}

const INAUSPICIOUS_BHAKOOT_DISTANCES = new Set([2, 12, 5, 9, 6, 8]);

export function bhakootScore(groomSignIndex: number, brideSignIndex: number): number {
  const forward = ((brideSignIndex - groomSignIndex + 12) % 12) + 1;
  const backward = ((groomSignIndex - brideSignIndex + 12) % 12) + 1;
  const afflicted = INAUSPICIOUS_BHAKOOT_DISTANCES.has(forward) || INAUSPICIOUS_BHAKOOT_DISTANCES.has(backward);
  return afflicted ? 0 : 7;
}

export function taraScore(groomNakshatraIndex: number, brideNakshatraIndex: number): number {
  const INAUSPICIOUS = new Set([3, 5, 7]);
  const countFrom = (from: number, to: number) => (((to - from + 27) % 27) % 9) + 1;
  const forwardOk = !INAUSPICIOUS.has(countFrom(brideNakshatraIndex, groomNakshatraIndex));
  const backwardOk = !INAUSPICIOUS.has(countFrom(groomNakshatraIndex, brideNakshatraIndex));
  return (forwardOk ? 1.5 : 0) + (backwardOk ? 1.5 : 0);
}

// Natural friendship between the 7 classical grahas (excludes Rahu/Ketu, not used for Moon-sign lordship).
type ClassicalGraha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
const FRIENDS: Record<ClassicalGraha, ClassicalGraha[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};
const ENEMIES: Record<ClassicalGraha, ClassicalGraha[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};

// Sign index (0-11) -> ruling planet, standard Vedic rulerships.
export const RASHI_LORD: ClassicalGraha[] = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

function relation(a: ClassicalGraha, b: ClassicalGraha): 'friend' | 'neutral' | 'enemy' {
  if (a === b) return 'friend';
  if (FRIENDS[a].includes(b)) return 'friend';
  if (ENEMIES[a].includes(b)) return 'enemy';
  return 'neutral';
}

export function grahaMaitriScore(groomSignIndex: number, brideSignIndex: number): number {
  const groomLord = RASHI_LORD[groomSignIndex];
  const brideLord = RASHI_LORD[brideSignIndex];
  const ab = relation(groomLord, brideLord);
  const ba = relation(brideLord, groomLord);
  const points: Record<string, number> = { friend: 1, neutral: 0.5, enemy: 0 };
  const total = points[ab] + points[ba];
  // Scale the 0-2 mutual-relation sum onto the 0-5 Graha Maitri points.
  return Math.round((total / 2) * 5 * 2) / 2;
}

export function nadiScore(a: Nadi, b: Nadi): number {
  return a === b ? 0 : 8;
}
