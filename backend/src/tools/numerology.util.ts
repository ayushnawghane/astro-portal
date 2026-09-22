const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const MASTER_NUMBERS = new Set([11, 22, 33]);

function reduceNumber(n: number): number {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

export function lifePathNumber(dateOfBirth: Date): number {
  const digits = `${dateOfBirth.getUTCFullYear()}${dateOfBirth.getUTCMonth() + 1}${dateOfBirth.getUTCDate()}`;
  const sum = digits.split('').reduce((total, d) => total + Number(d), 0);
  return reduceNumber(sum);
}

export function destinyNumber(fullName: string): number {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, '');
  const sum = letters.split('').reduce((total, ch) => total + (LETTER_VALUES[ch] ?? 0), 0);
  return reduceNumber(sum);
}

export function soulUrgeNumber(fullName: string): number {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, '');
  const sum = letters
    .split('')
    .filter((ch) => VOWELS.has(ch))
    .reduce((total, ch) => total + (LETTER_VALUES[ch] ?? 0), 0);
  return reduceNumber(sum);
}

export const NUMBER_MEANINGS: Record<number, string> = {
  1: 'Leadership, independence, and originality.',
  2: 'Cooperation, diplomacy, and sensitivity to others.',
  3: 'Creativity, self-expression, and optimism.',
  4: 'Discipline, stability, and hard work.',
  5: 'Freedom, adaptability, and adventure.',
  6: 'Responsibility, nurturing, and harmony.',
  7: 'Introspection, analysis, and spirituality.',
  8: 'Ambition, authority, and material success.',
  9: 'Compassion, idealism, and humanitarianism.',
  11: 'Master Number — intuition, inspiration, and spiritual insight.',
  22: 'Master Number — the "Master Builder", turning big dreams into reality.',
  33: 'Master Number — the "Master Teacher", selfless service and healing.',
};
