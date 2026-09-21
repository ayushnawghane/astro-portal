import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProfileDto } from './dto/create-profile.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: {
        userId,
        relation: dto.relation,
        name: dto.name,
        gender: dto.gender,
        dateOfBirth: new Date(dto.dateOfBirth),
        timeOfBirth: dto.timeOfBirth,
        placeOfBirth: dto.placeOfBirth,
        latitude: dto.latitude,
        longitude: dto.longitude,
        timezone: dto.timezone,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.profile.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async findOwned(id: string, userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found.');
    if (profile.userId !== userId) throw new ForbiddenException('This profile does not belong to you.');
    return profile;
  }

  async findOne(id: string, userId: string) {
    return this.findOwned(id, userId);
  }

  async update(id: string, userId: string, dto: UpdateProfileDto) {
    await this.findOwned(id, userId);
    return this.prisma.profile.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOwned(id, userId);
    await this.prisma.profile.delete({ where: { id } });
    return { message: 'Profile deleted.' };
  }
}
