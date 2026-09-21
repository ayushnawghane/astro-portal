import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AstrologersService } from './astrologers.service.js';
import { ApplyAstrologerDto } from './dto/apply-astrologer.dto.js';
import { UpdateAstrologerDto } from './dto/update-astrologer.dto.js';
import { SearchAstrologersDto } from './dto/search-astrologers.dto.js';
import { SetBadgeDto } from './dto/set-badge.dto.js';
import { SetOnboardingStageDto } from './dto/set-onboarding-stage.dto.js';
import { UserRole } from '../generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@Controller('astrologers')
export class AstrologersController {
  constructor(private readonly astrologers: AstrologersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(@CurrentUser() user: AuthenticatedUser, @Body() dto: ApplyAstrologerDto) {
    return this.astrologers.apply(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  myProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.astrologers.findMyProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAstrologerDto) {
    return this.astrologers.update(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/dashboard')
  myDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.astrologers.dashboard(user.userId);
  }

  @Get()
  search(@Query() dto: SearchAstrologersDto) {
    return this.astrologers.search(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.astrologers.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.astrologers.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/badge')
  setBadge(@Param('id') id: string, @Body() dto: SetBadgeDto) {
    return this.astrologers.setBadge(id, dto.badge);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/onboarding-stage')
  setOnboardingStage(@Param('id') id: string, @Body() dto: SetOnboardingStageDto) {
    return this.astrologers.setOnboardingStage(id, dto.onboardingStage);
  }
}
