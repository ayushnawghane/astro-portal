import { Module } from '@nestjs/common';
import { MatchmakingController } from './matchmaking.controller.js';
import { MatchmakingService } from './matchmaking.service.js';
import { KundliModule } from '../kundli/kundli.module.js';

@Module({
  imports: [KundliModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
})
export class MatchmakingModule {}
