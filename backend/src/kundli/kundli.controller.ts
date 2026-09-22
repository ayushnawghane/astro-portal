import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { KundliService } from './kundli.service.js';
import { KundliPdfService } from './pdf/kundli-pdf.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import type { DashaPeriod, DoshaResult, PlanetPosition, YogaResult } from './astrology/astrology.types.js';

@UseGuards(JwtAuthGuard)
@Controller('kundli')
export class KundliController {
  constructor(
    private readonly kundli: KundliService,
    private readonly pdf: KundliPdfService,
  ) {}

  @Post('profiles/:profileId/generate')
  generate(@CurrentUser() user: AuthenticatedUser, @Param('profileId') profileId: string) {
    return this.kundli.generate(profileId, user.userId);
  }

  @Get('profiles/:profileId')
  listForProfile(@CurrentUser() user: AuthenticatedUser, @Param('profileId') profileId: string) {
    return this.kundli.listForProfile(profileId, user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.kundli.findOne(id, user.userId);
  }

  @Get(':id/pdf')
  async downloadPdf(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Res() res: Response) {
    const report = await this.kundli.findOne(id, user.userId);
    const chartData = report.chartData as { ascendant: { rashi: string }; moonNakshatra: { name: string; pada: number } };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kundli-${report.id}.pdf"`);

    const doc = this.pdf.build({
      profileName: report.profile.name,
      dateOfBirth: report.profile.dateOfBirth,
      timeOfBirth: report.profile.timeOfBirth,
      placeOfBirth: report.profile.placeOfBirth,
      ascendantRashi: chartData.ascendant.rashi,
      planets: report.planetaryPositions as unknown as PlanetPosition[],
      houses: report.houseAnalysis as unknown as { house: number; rashi: string }[],
      moonNakshatra: chartData.moonNakshatra,
      dashas: report.dashaInfo as unknown as DashaPeriod[],
      doshas: report.doshas as unknown as DoshaResult[],
      yogas: (report.yogas ?? []) as unknown as YogaResult[],
      generatedAt: report.createdAt,
    });

    doc.pipe(res);
  }
}
