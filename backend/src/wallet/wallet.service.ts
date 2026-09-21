import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    const existing = await this.prisma.wallet.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.wallet.create({ data: { userId, balance: 0 } });
  }

  async getBalance(userId: string) {
    return this.getOrCreate(userId);
  }

  async history(userId: string, page = 1, pageSize = 20) {
    const wallet = await this.getOrCreate(userId);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);
    return { items, total, page, pageSize };
  }

  /**
   * Simulates a successful payment capture and credits the wallet.
   * Swap the internals for a real gateway (Razorpay/Stripe) integration —
   * this should only run after that gateway confirms payment succeeded.
   */
  async recharge(userId: string, amount: number, description?: string) {
    const wallet = await this.getOrCreate(userId);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });
      await tx.walletTransaction.create({
        data: { walletId: wallet.id, type: 'RECHARGE', amount, description: description ?? 'Wallet recharge' },
      });
      return updated;
    });
  }

  async debit(userId: string, amount: number, description?: string) {
    const wallet = await this.getOrCreate(userId);
    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient wallet balance.');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });
      await tx.walletTransaction.create({
        data: { walletId: wallet.id, type: 'DEBIT', amount, description: description ?? 'Consultation charge' },
      });
      return updated;
    });
  }

  async refund(userId: string, amount: number, description?: string) {
    const wallet = await this.getOrCreate(userId);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });
      await tx.walletTransaction.create({
        data: { walletId: wallet.id, type: 'REFUND', amount, description: description ?? 'Refund' },
      });
      return updated;
    });
  }
}
