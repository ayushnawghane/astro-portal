import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PanchangService } from './panchang.service.js';
import { CreatePanchangDto } from './dto/create-panchang.dto.js';
import { UpdatePanchangDto } from './dto/update-panchang.dto.js';
import { UserRole } from '../generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('panchang')
export class PanchangController {
  constructor(private readonly panchang: PanchangService) {}

  @Get()
  findOne(@Query('location') location: string, @Query('date') date?: string) {
    return this.panchang.findOne(location, date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  upsert(@Body() dto: CreatePanchangDto) {
    return this.panchang.upsert(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePanchangDto) {
    return this.panchang.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.panchang.remove(id);
  }
}
