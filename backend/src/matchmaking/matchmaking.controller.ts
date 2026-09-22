import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service.js';
import { CompareProfilesDto } from './dto/compare-profiles.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmaking: MatchmakingService) {}

  @Post('compare')
  compare(@CurrentUser() user: AuthenticatedUser, @Body() dto: CompareProfilesDto) {
    return this.matchmaking.compare(dto.profileIdA, dto.profileIdB, user.userId);
  }
}
