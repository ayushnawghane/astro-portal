import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePanchangDto } from './dto/create-panchang.dto.js';
import type { UpdatePanchangDto } from './dto/update-panchang.dto.js';

function toDateOnly(value?: string): Date {
  const d = value ? new Date(value) : new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class PanchangService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(dto: CreatePanchangDto) {
    const date = toDateOnly(dto.date);
    return this.prisma.panchang.upsert({
      where: { date_location: { date, location: dto.location } },
      create: {
        ...dto,
        date,
        sunrise: new Date(dto.sunrise),
        sunset: new Date(dto.sunset),
        moonrise: dto.moonrise ? new Date(dto.moonrise) : undefined,
        moonset: dto.moonset ? new Date(dto.moonset) : undefined,
      },
      update: {
        ...dto,
        date,
        sunrise: new Date(dto.sunrise),
        sunset: new Date(dto.sunset),
        moonrise: dto.moonrise ? new Date(dto.moonrise) : undefined,
        moonset: dto.moonset ? new Date(dto.moonset) : undefined,
      },
    });
  }

  async findOne(location: string, dateStr?: string) {
    const date = toDateOnly(dateStr);
    const panchang = await this.prisma.panchang.findUnique({
      where: { date_location: { date, location } },
    });
    if (!panchang) throw new NotFoundException('Panchang not found for this location/date.');
    return panchang;
  }

  async update(id: string, dto: UpdatePanchangDto) {
    await this.ensureExists(id);
    return this.prisma.panchang.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? toDateOnly(dto.date) : undefined,
        sunrise: dto.sunrise ? new Date(dto.sunrise) : undefined,
        sunset: dto.sunset ? new Date(dto.sunset) : undefined,
        moonrise: dto.moonrise ? new Date(dto.moonrise) : undefined,
        moonset: dto.moonset ? new Date(dto.moonset) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.panchang.delete({ where: { id } });
    return { message: 'Panchang entry deleted.' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.panchang.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Panchang entry not found.');
    return found;
  }
}
