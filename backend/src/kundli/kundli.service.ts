import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AstrologyCalculationService } from './astrology/astrology-calculation.service.js';

function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

@Injectable()
export class KundliService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly astrology: AstrologyCalculationService,
  ) {}

  private async getOwnedProfile(profileId: string, userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found.');
    if (profile.userId !== userId) throw new ForbiddenException('This profile does not belong to you.');
    if (profile.latitude == null || profile.longitude == null) {
      throw new BadRequestException(
        'This profile is missing birth-place coordinates (latitude/longitude), which are required to compute an accurate chart.',
      );
    }
    return profile;
  }

  async generate(profileId: string, userId: string) {
    const profile = await this.getOwnedProfile(profileId, userId);
    const timezone = profile.timezone ?? 'Asia/Kolkata'; // default assumption; see AstrologyCalculationService docs

    const chart = this.astrology.computeBirthChart(
      profile.dateOfBirth,
      profile.timeOfBirth,
      timezone,
      profile.latitude!,
      profile.longitude!,
    );

    return this.prisma.kundliReport.create({
      data: {
        profileId,
        chartData: toJson({
          ascendant: chart.ascendant,
          houses: chart.houses,
          julianDayUT: chart.julianDayUT,
          moonNakshatra: chart.moonNakshatra,
        }),
        planetaryPositions: toJson(chart.planets),
        houseAnalysis: toJson(chart.houses),
        dashaInfo: toJson(chart.dashas),
        doshas: toJson(chart.doshas),
        yogas: toJson(chart.yogas),
      },
    });
  }

  async findOne(id: string, userId: string) {
    const report = await this.prisma.kundliReport.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!report) throw new NotFoundException('Kundli report not found.');
    if (report.profile.userId !== userId) throw new ForbiddenException('This report does not belong to you.');
    return report;
  }

  async listForProfile(profileId: string, userId: string) {
    await this.getOwnedProfileLenient(profileId, userId);
    return this.prisma.kundliReport.findMany({ where: { profileId }, orderBy: { createdAt: 'desc' } });
  }

  private async getOwnedProfileLenient(profileId: string, userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found.');
    if (profile.userId !== userId) throw new ForbiddenException('This profile does not belong to you.');
    return profile;
  }
}
