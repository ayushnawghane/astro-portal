import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ContentCategory } from '../generated/prisma/enums.js';
import type { CreateContentDto } from './dto/create-content.dto.js';
import type { UpdateContentDto } from './dto/update-content.dto.js';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContentDto) {
    const existing = await this.prisma.content.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('An article with this slug already exists.');
    return this.prisma.content.create({
      data: { ...dto, publishedAt: dto.isPublished ? new Date() : null },
    });
  }

  async findPublished(category: ContentCategory, page = 1, pageSize = 20) {
    const where = { category, isPublished: true };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.content.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, slug: true, title: true, summary: true, tags: true, coverImageUrl: true, publishedAt: true },
      }),
      this.prisma.content.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.content.findUnique({ where: { slug } });
    if (!article || !article.isPublished) throw new NotFoundException('Article not found.');
    return article;
  }

  async listForAdmin(category?: ContentCategory, page = 1, pageSize = 20) {
    const where = category ? { category } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.content.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async update(id: string, dto: UpdateContentDto) {
    const existing = await this.ensureExists(id);
    const publishing = dto.isPublished && !existing.isPublished;
    return this.prisma.content.update({
      where: { id },
      data: { ...dto, publishedAt: publishing ? new Date() : undefined },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.content.delete({ where: { id } });
    return { message: 'Article deleted.' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.content.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Article not found.');
    return found;
  }
}
