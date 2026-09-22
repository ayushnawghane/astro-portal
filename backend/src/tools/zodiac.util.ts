export type WesternSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface SignInfo {
  sign: WesternSign;
  element: Element;
  rulingPlanet: string;
  // Month is 1-12; a sign's range can wrap year-end (Capricorn).
  start: { month: number; day: number };
  end: { month: number; day: number };
}

// Standard Western tropical sun-sign date ranges with traditional (pre-outer-planet) rulers,
// consistent with the traditional/Vedic framing used elsewhere in this app.
export const WESTERN_SIGNS: SignInfo[] = [
  { sign: 'Capricorn', element: 'Earth', rulingPlanet: 'Saturn', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { sign: 'Aquarius', element: 'Air', rulingPlanet: 'Saturn', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { sign: 'Pisces', element: 'Water', rulingPlanet: 'Jupiter', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
  { sign: 'Aries', element: 'Fire', rulingPlanet: 'Mars', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { sign: 'Taurus', element: 'Earth', rulingPlanet: 'Venus', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { sign: 'Gemini', element: 'Air', rulingPlanet: 'Mercury', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { sign: 'Cancer', element: 'Water', rulingPlanet: 'Moon', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { sign: 'Leo', element: 'Fire', rulingPlanet: 'Sun', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { sign: 'Virgo', element: 'Earth', rulingPlanet: 'Mercury', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { sign: 'Libra', element: 'Air', rulingPlanet: 'Venus', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { sign: 'Scorpio', element: 'Water', rulingPlanet: 'Mars', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { sign: 'Sagittarius', element: 'Fire', rulingPlanet: 'Jupiter', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
];

export function sunSignFor(dateOfBirth: Date): SignInfo {
  const month = dateOfBirth.getUTCMonth() + 1;
  const day = dateOfBirth.getUTCDate();
  const found = WESTERN_SIGNS.find(({ start, end }) => {
    if (start.month === end.month) return month === start.month && day >= start.day && day <= end.day;
    if (start.month > end.month) {
      // Wraps the year end (Capricorn: Dec 22 - Jan 19).
      return (month === start.month && day >= start.day) || (month === end.month && day <= end.day);
    }
    return (month === start.month && day >= start.day) || (month === end.month && day <= end.day) || (month > start.month && month < end.month);
  });
  return found ?? WESTERN_SIGNS[0];
}

const ELEMENT_PAIR_SCORE: Record<Element, Record<Element, { score: number; description: string }>> = {
  Fire: {
    Fire: { score: 90, description: 'Two Fire signs bring passion and high energy, though both may compete for the spotlight.' },
    Air: { score: 88, description: 'Air feeds Fire — a naturally energizing, communicative pairing.' },
    Earth: { score: 50, description: 'Fire and Earth move at different paces; patience helps bridge the gap.' },
    Water: { score: 45, description: 'Fire and Water can either temper or extinguish each other — needs conscious effort.' },
  },
  Earth: {
    Earth: { score: 88, description: 'Two Earth signs build a stable, grounded, dependable partnership.' },
    Water: { score: 90, description: 'Water nourishes Earth — a naturally supportive, nurturing pairing.' },
    Fire: { score: 50, description: 'Earth and Fire move at different paces; patience helps bridge the gap.' },
    Air: { score: 48, description: 'Earth and Air often value different things — practicality versus ideas.' },
  },
  Air: {
    Air: { score: 85, description: 'Two Air signs connect through ideas and conversation, though may lack grounding.' },
    Fire: { score: 88, description: 'Air feeds Fire — a naturally energizing, communicative pairing.' },
    Water: { score: 48, description: 'Air and Water can struggle — logic meeting emotion needs patience.' },
    Earth: { score: 48, description: 'Air and Earth often value different things — ideas versus practicality.' },
  },
  Water: {
    Water: { score: 90, description: 'Two Water signs share deep emotional understanding and intuition.' },
    Earth: { score: 90, description: 'Water nourishes Earth — a naturally supportive, nurturing pairing.' },
    Fire: { score: 45, description: 'Water and Fire can either temper or extinguish each other — needs conscious effort.' },
    Air: { score: 48, description: 'Water and Air can struggle — emotion meeting logic needs patience.' },
  },
};

export function zodiacCompatibility(a: WesternSign, b: WesternSign) {
  const elementA = WESTERN_SIGNS.find((s) => s.sign === a)!.element;
  const elementB = WESTERN_SIGNS.find((s) => s.sign === b)!.element;
  return { ...ELEMENT_PAIR_SCORE[elementA][elementB], elementA, elementB };
}
