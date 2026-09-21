import { Module } from '@nestjs/common';
import { AstrologersController } from './astrologers.controller.js';
import { AstrologersService } from './astrologers.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [AstrologersController],
  providers: [AstrologersService],
  exports: [AstrologersService],
})
export class AstrologersModule {}
