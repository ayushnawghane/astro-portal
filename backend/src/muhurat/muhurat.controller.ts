import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MuhuratService } from './muhurat.service.js';
import { CreateMuhuratDto } from './dto/create-muhurat.dto.js';
import { UpdateMuhuratDto } from './dto/update-muhurat.dto.js';
import { UserRole } from '../generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('muhurat')
export class MuhuratController {
  constructor(private readonly muhurat: MuhuratService) {}

  @Get(':activityType')
  findUpcoming(@Param('activityType') activityType: string, @Query('from') from?: string, @Query('limit') limit?: string) {
    return this.muhurat.findUpcoming(activityType, from, limit ? Number(limit) : 10);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  upsert(@Body() dto: CreateMuhuratDto) {
    return this.muhurat.upsert(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMuhuratDto) {
    return this.muhurat.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.muhurat.remove(id);
  }
}
