import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import type { ApplyAstrologerDto } from './dto/apply-astrologer.dto.js';
import type { UpdateAstrologerDto } from './dto/update-astrologer.dto.js';
import type { SearchAstrologersDto } from './dto/search-astrologers.dto.js';
import { UserRole, type AstrologerBadge, type OnboardingStage } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class AstrologersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async apply(userId: string, dto: ApplyAstrologerDto) {
    const existing = await this.prisma.astrologer.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('You have already applied to become an astrologer.');
    }
    const astrologer = await this.prisma.astrologer.create({
      data: { userId, ...dto },
    });
    await this.users.setRole(userId, UserRole.ASTROLOGER);
    return astrologer;
  }

  async search(dto: SearchAstrologersDto) {
    const page = dto.page ? Number(dto.page) : 1;
    const pageSize = dto.pageSize ? Number(dto.pageSize) : 20;

    const where: Prisma.AstrologerWhereInput = {
      isApproved: true,
      ...(dto.language ? { languages: { has: dto.language } } : {}),
      ...(dto.expertise ? { expertise: { has: dto.expertise } } : {}),
      ...(dto.badge ? { badge: dto.badge } : {}),
      ...(dto.search
        ? {
            OR: [
              { displayName: { contains: dto.search, mode: 'insensitive' } },
              { bio: { contains: dto.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.astrologer.findMany({
        where,
        orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.astrologer.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const astrologer = await this.prisma.astrologer.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!astrologer) throw new NotFoundException('Astrologer not found.');
    return astrologer;
  }

  async findMyProfile(userId: string) {
    const astrologer = await this.prisma.astrologer.findUnique({ where: { userId } });
    if (!astrologer) throw new NotFoundException('You have not applied to become an astrologer yet.');
    return astrologer;
  }

  async update(userId: string, dto: UpdateAstrologerDto) {
    const astrologer = await this.findMyProfile(userId);
    return this.prisma.astrologer.update({ where: { id: astrologer.id }, data: dto });
  }

  async dashboard(userId: string) {
    const astrologer = await this.findMyProfile(userId);
    const [completedCount, earnings] = await this.prisma.$transaction([
      this.prisma.consultation.count({ where: { astrologerId: astrologer.id, status: 'COMPLETED' } }),
      this.prisma.consultation.aggregate({
        where: { astrologerId: astrologer.id, status: 'COMPLETED' },
        _sum: { amountCharged: true },
      }),
    ]);
    return {
      astrologer,
      completedSessions: completedCount,
      totalEarnings: earnings._sum.amountCharged ?? 0,
    };
  }

  // --- Admin ---

  async approve(id: string) {
    await this.ensureExists(id);
    return this.prisma.astrologer.update({
      where: { id },
      data: { isApproved: true, onboardingStage: 'ACTIVE' },
    });
  }

  async setBadge(id: string, badge: AstrologerBadge) {
    await this.ensureExists(id);
    return this.prisma.astrologer.update({ where: { id }, data: { badge } });
  }

  async setOnboardingStage(id: string, onboardingStage: OnboardingStage) {
    await this.ensureExists(id);
    return this.prisma.astrologer.update({ where: { id }, data: { onboardingStage } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.astrologer.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Astrologer not found.');
    return found;
  }

  async assertOwnsOrAdmin(astrologerId: string, userId: string, role: string) {
    if (role === UserRole.ADMIN) return;
    const astrologer = await this.prisma.astrologer.findUnique({ where: { id: astrologerId } });
    if (!astrologer || astrologer.userId !== userId) {
      throw new ForbiddenException('You do not have access to this astrologer profile.');
    }
  }
}
