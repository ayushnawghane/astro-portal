import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import type { UserRole } from '../generated/prisma/enums.js';

function paginate(page?: string, pageSize?: string) {
  return { page: page ? Number(page) : 1, pageSize: pageSize ? Number(pageSize) : 20 };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async listUsers(query: { page?: string; pageSize?: string; role?: UserRole }) {
    const { page, pageSize } = paginate(query.page, query.pageSize);
    const where = query.role ? { role: query.role } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: { id: true, email: true, phone: true, role: true, isEmailVerified: true, isPhoneVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  setUserRole(id: string, role: UserRole) {
    return this.users.setRole(id, role);
  }

  async listAstrologers(query: { page?: string; pageSize?: string; isApproved?: string }) {
    const { page, pageSize } = paginate(query.page, query.pageSize);
    const where = query.isApproved !== undefined ? { isApproved: query.isApproved === 'true' } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.astrologer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.astrologer.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async listConsultations(query: { page?: string; pageSize?: string; status?: string }) {
    const { page, pageSize } = paginate(query.page, query.pageSize);
    const where = query.status ? { status: query.status as never } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.consultation.findMany({
        where,
        include: { astrologer: { select: { displayName: true } }, user: { select: { email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.consultation.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async listWalletTransactions(query: { page?: string; pageSize?: string }) {
    const { page, pageSize } = paginate(query.page, query.pageSize);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        include: { wallet: { select: { user: { select: { email: true, phone: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async revenueDashboard() {
    const [userCount, astrologerCount, completedConsultations, revenueAgg, rechargeAgg] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.astrologer.count({ where: { isApproved: true } }),
      this.prisma.consultation.count({ where: { status: 'COMPLETED' } }),
      this.prisma.consultation.aggregate({ where: { status: 'COMPLETED' }, _sum: { amountCharged: true } }),
      this.prisma.walletTransaction.aggregate({ where: { type: 'RECHARGE' }, _sum: { amount: true } }),
    ]);
    return {
      totalUsers: userCount,
      approvedAstrologers: astrologerCount,
      completedConsultations,
      totalConsultationRevenue: revenueAgg._sum.amountCharged ?? 0,
      totalWalletRecharges: rechargeAgg._sum.amount ?? 0,
    };
  }
}
