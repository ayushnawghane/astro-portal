import { Module } from '@nestjs/common';
import { KundliController } from './kundli.controller.js';
import { KundliService } from './kundli.service.js';
import { AstrologyCalculationService } from './astrology/astrology-calculation.service.js';
import { KundliPdfService } from './pdf/kundli-pdf.service.js';

@Module({
  controllers: [KundliController],
  providers: [KundliService, AstrologyCalculationService, KundliPdfService],
  exports: [AstrologyCalculationService],
})
export class KundliModule {}
