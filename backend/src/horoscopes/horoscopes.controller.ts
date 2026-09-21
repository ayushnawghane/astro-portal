import { Body, Controller, Delete, Get, Param, ParseEnumPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { HoroscopesService } from './horoscopes.service.js';
import { CreateHoroscopeDto } from './dto/create-horoscope.dto.js';
import { UpdateHoroscopeDto } from './dto/update-horoscope.dto.js';
import { HoroscopeType, UserRole } from '../generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('horoscopes')
export class HoroscopesController {
  constructor(private readonly horoscopes: HoroscopesService) {}

  // Public SEO-facing reads.

  @Get(':sign')
  findAllTypesForSign(@Param('sign') sign: string, @Query('date') date?: string) {
    return this.horoscopes.findAllTypesForSign(sign, date);
  }

  @Get(':sign/:type')
  findOne(
    @Param('sign') sign: string,
    @Param('type', new ParseEnumPipe(HoroscopeType)) type: HoroscopeType,
    @Query('date') date?: string,
  ) {
    return this.horoscopes.findOne(sign, type, date);
  }

  @Get(':sign/:type/archive')
  findArchive(
    @Param('sign') sign: string,
    @Param('type', new ParseEnumPipe(HoroscopeType)) type: HoroscopeType,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.horoscopes.findArchive(sign, type, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }

  // Admin content management.

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  upsert(@Body() dto: CreateHoroscopeDto) {
    return this.horoscopes.upsert(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHoroscopeDto) {
    return this.horoscopes.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.horoscopes.remove(id);
  }
}
