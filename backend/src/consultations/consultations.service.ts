import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { UsersService } from '../users/users.service.js';
import type { CreateConsultationDto } from './dto/create-consultation.dto.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';
import { UserRole } from '../generated/prisma/enums.js';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly users: UsersService,
  ) {}

  async request(userId: string, dto: CreateConsultationDto) {
    const astrologer = await this.prisma.astrologer.findUnique({ where: { id: dto.astrologerId } });
    if (!astrologer || !astrologer.isApproved) {
      throw new NotFoundException('Astrologer not found or not available for consultations.');
    }
    if (!astrologer.isAvailable) {
      throw new BadRequestException('This astrologer is not currently available.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isFreeSession = dto.type === 'CHAT' && !user?.hasUsedFreeChat;

    const consultation = await this.prisma.consultation.create({
      data: {
        userId,
        astrologerId: dto.astrologerId,
        type: dto.type,
        status: 'PENDING',
        isFreeSession,
      },
    });

    if (isFreeSession) {
      await this.users.markFreeChatUsed(userId);
    }

    return consultation;
  }

  async accept(consultationId: string, astrologerUserId: string) {
    const consultation = await this.getWithParties(consultationId);
    this.assertIsAstrologerParty(consultation, astrologerUserId);
    if (consultation.status !== 'PENDING') {
      throw new BadRequestException('Only pending consultations can be accepted.');
    }
    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'ACTIVE', startedAt: new Date() },
    });
  }

  async reject(consultationId: string, astrologerUserId: string) {
    const consultation = await this.getWithParties(consultationId);
    this.assertIsAstrologerParty(consultation, astrologerUserId);
    if (consultation.status !== 'PENDING') {
      throw new BadRequestException('Only pending consultations can be rejected.');
    }
    return this.prisma.consultation.update({ where: { id: consultationId }, data: { status: 'CANCELLED' } });
  }

  async cancel(consultationId: string, userId: string) {
    const consultation = await this.getWithParties(consultationId);
    if (consultation.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own consultation requests.');
    }
    if (consultation.status !== 'PENDING') {
      throw new BadRequestException('Only pending consultations can be cancelled.');
    }
    return this.prisma.consultation.update({ where: { id: consultationId }, data: { status: 'CANCELLED' } });
  }

  async end(consultationId: string, callerUserId: string, callerRole: string) {
    const consultation = await this.getWithParties(consultationId);
    if (callerRole !== UserRole.ADMIN) {
      this.assertIsParty(consultation, callerUserId);
    }
    if (consultation.status !== 'ACTIVE') {
      throw new BadRequestException('Only active consultations can be ended.');
    }

    const endedAt = new Date();
    const startedAt = consultation.startedAt ?? endedAt;
    const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));

    let amountCharged = 0;
    if (!consultation.isFreeSession && durationSeconds > 0) {
      const billableMinutes = Math.ceil(durationSeconds / 60);
      const rate =
        consultation.type === 'VOICE'
          ? (consultation.astrologer.pricePerMinuteVoice ?? consultation.astrologer.pricePerMinuteChat)
          : consultation.astrologer.pricePerMinuteChat;
      amountCharged = billableMinutes * Number(rate);
      await this.wallet.debit(
        consultation.userId,
        amountCharged,
        `Consultation with ${consultation.astrologer.displayName}`,
      );
    }

    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'COMPLETED', endedAt, durationSeconds, amountCharged },
    });
  }

  async findForUser(userId: string, status?: string) {
    return this.prisma.consultation.findMany({
      where: { userId, ...(status ? { status: status as never } : {}) },
      include: { astrologer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForAstrologer(astrologerUserId: string, status?: string) {
    const astrologer = await this.prisma.astrologer.findUnique({ where: { userId: astrologerUserId } });
    if (!astrologer) throw new NotFoundException('Astrologer profile not found.');
    return this.prisma.consultation.findMany({
      where: { astrologerId: astrologer.id, ...(status ? { status: status as never } : {}) },
      include: { user: { select: { id: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, callerUserId: string, callerRole: string) {
    const consultation = await this.getWithParties(id);
    if (callerRole !== UserRole.ADMIN) {
      this.assertIsParty(consultation, callerUserId);
    }
    return consultation;
  }

  async getMessages(consultationId: string, callerUserId: string, callerRole: string) {
    const consultation = await this.getWithParties(consultationId);
    if (callerRole !== UserRole.ADMIN) {
      this.assertIsParty(consultation, callerUserId);
    }
    return this.prisma.chatMessage.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMessage(consultationId: string, senderId: string, content: string, attachmentUrl?: string) {
    const consultation = await this.getWithParties(consultationId);
    this.assertIsParty(consultation, senderId);
    if (consultation.status !== 'ACTIVE') {
      throw new BadRequestException('Messages can only be sent in an active consultation.');
    }
    return this.prisma.chatMessage.create({
      data: { consultationId, senderId, content, attachmentUrl },
    });
  }

  async addReview(consultationId: string, userId: string, dto: CreateReviewDto) {
    const consultation = await this.getWithParties(consultationId);
    if (consultation.userId !== userId) {
      throw new ForbiddenException('You can only review your own consultations.');
    }
    if (consultation.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review a completed consultation.');
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          consultationId,
          userId,
          astrologerId: consultation.astrologerId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });
      const agg = await tx.review.aggregate({
        where: { astrologerId: consultation.astrologerId },
        _avg: { rating: true },
        _count: true,
      });
      await tx.astrologer.update({
        where: { id: consultation.astrologerId },
        data: { ratingAvg: agg._avg.rating ?? dto.rating, ratingCount: agg._count },
      });
      return created;
    });

    return review;
  }

  private async getWithParties(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: { astrologer: true },
    });
    if (!consultation) throw new NotFoundException('Consultation not found.');
    return consultation;
  }

  private assertIsAstrologerParty(consultation: { astrologer: { userId: string } }, astrologerUserId: string) {
    if (consultation.astrologer.userId !== astrologerUserId) {
      throw new ForbiddenException('You are not the astrologer for this consultation.');
    }
  }

  private assertIsParty(consultation: { userId: string; astrologer: { userId: string } }, callerUserId: string) {
    if (consultation.userId !== callerUserId && consultation.astrologer.userId !== callerUserId) {
      throw new ForbiddenException('You are not a party to this consultation.');
    }
  }
}
