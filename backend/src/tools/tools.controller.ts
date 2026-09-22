import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ToolsService } from './tools.service.js';
import { NumerologyDto } from './dto/numerology.dto.js';
import { ZodiacCompatibilityDto } from './dto/zodiac-compatibility.dto.js';

@Controller('tools')
export class ToolsController {
  constructor(private readonly tools: ToolsService) {}

  @Post('numerology')
  numerology(@Body() dto: NumerologyDto) {
    return this.tools.numerology(dto.fullName, dto.dateOfBirth);
  }

  @Get('zodiac-sign')
  zodiacSign(@Query('dateOfBirth') dateOfBirth: string) {
    return this.tools.zodiacSign(dateOfBirth);
  }

  @Post('zodiac-compatibility')
  zodiacCompatibility(@Body() dto: ZodiacCompatibilityDto) {
    return this.tools.zodiacCompatibility(dto.signA, dto.signB);
  }

  @Get('tarot/draw')
  drawTarot(@Query('spread') spread?: string) {
    return this.tools.drawTarot(spread === 'three' ? 'three' : 'single');
  }
}
