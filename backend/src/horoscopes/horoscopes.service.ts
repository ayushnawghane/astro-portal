import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateHoroscopeDto } from './dto/create-horoscope.dto.js';
import type { UpdateHoroscopeDto } from './dto/update-horoscope.dto.js';
import type { HoroscopeType } from '../generated/prisma/enums.js';

function toDateOnly(value?: string): Date {
  const d = value ? new Date(value) : new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class HoroscopesService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(dto: CreateHoroscopeDto) {
    const date = toDateOnly(dto.date);
    return this.prisma.horoscope.upsert({
      where: {
        zodiacSign_type_date: { zodiacSign: dto.zodiacSign, type: dto.type, date },
      },
      create: { ...dto, date },
      update: { ...dto, date },
    });
  }

  async findOne(zodiacSign: string, type: HoroscopeType, dateStr?: string) {
    const date = toDateOnly(dateStr);
    const horoscope = await this.prisma.horoscope.findUnique({
      where: { zodiacSign_type_date: { zodiacSign, type, date } },
    });
    if (!horoscope) throw new NotFoundException('Horoscope not found for this sign/type/date.');
    return horoscope;
  }

  findAllTypesForSign(zodiacSign: string, dateStr?: string) {
    const date = toDateOnly(dateStr);
    return this.prisma.horoscope.findMany({
      where: { zodiacSign, date },
    });
  }

  async findArchive(zodiacSign: string, type: HoroscopeType, page = 1, pageSize = 20) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.horoscope.findMany({
        where: { zodiacSign, type },
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.horoscope.count({ where: { zodiacSign, type } }),
    ]);
    return { items, total, page, pageSize };
  }

  async update(id: string, dto: UpdateHoroscopeDto) {
    await this.ensureExists(id);
    return this.prisma.horoscope.update({
      where: { id },
      data: { ...dto, date: dto.date ? toDateOnly(dto.date) : undefined },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.horoscope.delete({ where: { id } });
    return { message: 'Horoscope entry deleted.' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.horoscope.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Horoscope entry not found.');
    return found;
  }
}
