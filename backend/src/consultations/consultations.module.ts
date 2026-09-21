import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller.js';
import { ConsultationsService } from './consultations.service.js';
import { ConsultationsGateway } from './gateway/consultations.gateway.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [WalletModule, UsersModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, ConsultationsGateway],
})
export class ConsultationsModule {}
