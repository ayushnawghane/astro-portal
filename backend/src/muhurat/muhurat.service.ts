import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { CreateMuhuratDto } from './dto/create-muhurat.dto.js';
import type { UpdateMuhuratDto } from './dto/update-muhurat.dto.js';

function toDateOnly(value?: string): Date {
  const d = value ? new Date(value) : new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

@Injectable()
export class MuhuratService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(dto: CreateMuhuratDto) {
    const date = toDateOnly(dto.date);
    return this.prisma.shubhMuhurat.upsert({
      where: { activityType_date: { activityType: dto.activityType, date } },
      create: { ...dto, date, timings: toJson(dto.timings) },
      update: { ...dto, date, timings: toJson(dto.timings) },
    });
  }

  async findUpcoming(activityType: string, fromDateStr?: string, limit = 10) {
    const fromDate = toDateOnly(fromDateStr);
    return this.prisma.shubhMuhurat.findMany({
      where: { activityType, date: { gte: fromDate } },
      orderBy: { date: 'asc' },
      take: limit,
    });
  }

  async update(id: string, dto: UpdateMuhuratDto) {
    await this.ensureExists(id);
    return this.prisma.shubhMuhurat.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? toDateOnly(dto.date) : undefined,
        timings: dto.timings ? toJson(dto.timings) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.shubhMuhurat.delete({ where: { id } });
    return { message: 'Muhurat entry deleted.' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.shubhMuhurat.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Muhurat entry not found.');
    return found;
  }
}
