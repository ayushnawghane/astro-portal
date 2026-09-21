import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service.js';
import { RechargeWalletDto } from './dto/recharge-wallet.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('me')
  myWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.wallet.getBalance(user.userId);
  }

  @Get('me/transactions')
  myTransactions(@CurrentUser() user: AuthenticatedUser, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.wallet.history(user.userId, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }

  @Post('me/recharge')
  recharge(@CurrentUser() user: AuthenticatedUser, @Body() dto: RechargeWalletDto) {
    return this.wallet.recharge(user.userId, dto.amount, dto.description);
  }
}
