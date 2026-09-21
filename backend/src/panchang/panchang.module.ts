import { Module } from '@nestjs/common';
import { PanchangController } from './panchang.controller.js';
import { PanchangService } from './panchang.service.js';

@Module({
  controllers: [PanchangController],
  providers: [PanchangService],
})
export class PanchangModule {}
