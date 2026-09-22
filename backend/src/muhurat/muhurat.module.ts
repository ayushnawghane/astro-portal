import { Module } from '@nestjs/common';
import { MuhuratController } from './muhurat.controller.js';
import { MuhuratService } from './muhurat.service.js';

@Module({
  controllers: [MuhuratController],
  providers: [MuhuratService],
})
export class MuhuratModule {}
