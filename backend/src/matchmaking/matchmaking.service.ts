import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AstrologyCalculationService } from '../kundli/astrology/astrology-calculation.service.js';
import { NAKSHATRAS } from '../kundli/astrology/astrology.constants.js';
import { ZODIAC_SIGNS } from '../common/zodiac-signs.js';
import {
  NAKSHATRA_GANA,
  NAKSHATRA_YONI,
  NAKSHATRA_NADI,
  varnaScore,
  vashyaScore,
  taraScore,
  yoniScore,
  ganaScore,
  grahaMaitriScore,
  bhakootScore,
  nadiScore,
} from './ashtakoot.data.js';

interface KootaResult {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MatchResult {
  totalScore: number;
  maxScore: number;
  kootas: KootaResult[];
  verdict: string;
  mangalDosha: { groom: boolean; bride: boolean; compatible: boolean; note: string };
}

@Injectable()
export class MatchmakingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly astrology: AstrologyCalculationService,
  ) {}

  async compare(profileIdA: string, profileIdB: string, userId: string): Promise<MatchResult> {
    const [a, b] = await Promise.all([
      this.getOwnedProfile(profileIdA, userId),
      this.getOwnedProfile(profileIdB, userId),
    ]);

    const chartA = this.astrology.computeBirthChart(a.dateOfBirth, a.timeOfBirth, a.timezone ?? 'Asia/Kolkata', a.latitude!, a.longitude!);
    const chartB = this.astrology.computeBirthChart(b.dateOfBirth, b.timeOfBirth, b.timezone ?? 'Asia/Kolkata', b.latitude!, b.longitude!);

    const moonA = chartA.planets.find((p) => p.graha === 'Moon')!;
    const moonB = chartB.planets.find((p) => p.graha === 'Moon')!;
    const signA = ZODIAC_SIGNS.indexOf(moonA.rashi as (typeof ZODIAC_SIGNS)[number]);
    const signB = ZODIAC_SIGNS.indexOf(moonB.rashi as (typeof ZODIAC_SIGNS)[number]);

    const nakA = this.nakshatraIndex(moonA.nakshatra);
    const nakB = this.nakshatraIndex(moonB.nakshatra);

    const kootas: KootaResult[] = [
      { name: 'Varna', score: varnaScore(signA, signB), maxScore: 1, description: 'Spiritual/work compatibility based on Moon-sign Varna.' },
      { name: 'Vashya', score: vashyaScore(signA, signB), maxScore: 2, description: 'Mutual control and attraction between the partners.' },
      { name: 'Tara', score: taraScore(nakA, nakB), maxScore: 3, description: 'Birth-star compatibility and general wellbeing.' },
      { name: 'Yoni', score: yoniScore(NAKSHATRA_YONI[nakA], NAKSHATRA_YONI[nakB]), maxScore: 4, description: 'Physical and sexual compatibility.' },
      { name: 'Graha Maitri', score: grahaMaitriScore(signA, signB), maxScore: 5, description: 'Compatibility of mindset, based on Moon-sign lord friendship.' },
      { name: 'Gana', score: ganaScore(NAKSHATRA_GANA[nakA], NAKSHATRA_GANA[nakB]), maxScore: 6, description: 'Temperament and nature compatibility.' },
      { name: 'Bhakoot', score: bhakootScore(signA, signB), maxScore: 7, description: 'Overall relationship, financial and family harmony.' },
      { name: 'Nadi', score: nadiScore(NAKSHATRA_NADI[nakA], NAKSHATRA_NADI[nakB]), maxScore: 8, description: 'Health and genetic compatibility for progeny.' },
    ];

    const totalScore = Math.round(kootas.reduce((sum, k) => sum + k.score, 0) * 2) / 2;
    const maxScore = kootas.reduce((sum, k) => sum + k.maxScore, 0);

    let verdict: string;
    if (totalScore >= 28) verdict = 'Excellent match.';
    else if (totalScore >= 21) verdict = 'Good match.';
    else if (totalScore >= 18) verdict = 'Average match — consider consulting an astrologer.';
    else verdict = 'Not recommended without a detailed consultation.';

    const marsA = chartA.planets.find((p) => p.graha === 'Mars')!;
    const marsB = chartB.planets.find((p) => p.graha === 'Mars')!;
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    const manglikA = mangalHouses.includes(marsA.house);
    const manglikB = mangalHouses.includes(marsB.house);
    const mangalCompatible = manglikA === manglikB;

    return {
      totalScore,
      maxScore,
      kootas,
      verdict,
      mangalDosha: {
        groom: manglikA,
        bride: manglikB,
        compatible: mangalCompatible,
        note: mangalCompatible
          ? manglikA
            ? 'Both partners are Manglik, which classically balances the Mangal Dosha.'
            : 'Neither partner is Manglik.'
          : 'Only one partner is Manglik — classically considered significant and worth discussing with an astrologer.',
      },
    };
  }

  private nakshatraIndex(name: string): number {
    return (NAKSHATRAS as readonly string[]).indexOf(name);
  }

  private async getOwnedProfile(profileId: string, userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException(`Profile ${profileId} not found.`);
    if (profile.userId !== userId) throw new ForbiddenException('One of these profiles does not belong to you.');
    if (profile.latitude == null || profile.longitude == null) {
      throw new ForbiddenException(`Profile "${profile.name}" is missing birth coordinates, required for matching.`);
    }
    return profile;
  }
}
