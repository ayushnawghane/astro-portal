import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ConsultationsService } from './consultations.service.js';
import { CreateConsultationDto } from './dto/create-consultation.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultations: ConsultationsService) {}

  @Post()
  request(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateConsultationDto) {
    return this.consultations.request(user.userId, dto);
  }

  @Get('me')
  myConsultations(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string) {
    return this.consultations.findForUser(user.userId, status);
  }

  @Get('astrologer/me')
  myAstrologerConsole(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string) {
    return this.consultations.findForAstrologer(user.userId, status);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consultations.accept(id, user.userId);
  }

  @Post(':id/reject')
  reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consultations.reject(id, user.userId);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consultations.cancel(id, user.userId);
  }

  @Post(':id/end')
  end(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consultations.end(id, user.userId, user.role);
  }

  @Post(':id/review')
  review(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CreateReviewDto) {
    return this.consultations.addReview(id, user.userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consultations.findOne(id, user.userId, user.role);
  }

  @Get(':id/messages')
  messages(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consultations.getMessages(id, user.userId, user.role);
  }
}
