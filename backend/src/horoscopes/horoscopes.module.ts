import { Module } from '@nestjs/common';
import { HoroscopesController } from './horoscopes.controller.js';
import { HoroscopesService } from './horoscopes.service.js';

@Module({
  controllers: [HoroscopesController],
  providers: [HoroscopesService],
})
export class HoroscopesModule {}
