import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { HoroscopesModule } from './horoscopes/horoscopes.module.js';
import { PanchangModule } from './panchang/panchang.module.js';
import { KundliModule } from './kundli/kundli.module.js';
import { AstrologersModule } from './astrologers/astrologers.module.js';
import { WalletModule } from './wallet/wallet.module.js';
import { ConsultationsModule } from './consultations/consultations.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    HoroscopesModule,
    PanchangModule,
    KundliModule,
    AstrologersModule,
    WalletModule,
    ConsultationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
