import { Body, Controller, Delete, Get, Param, ParseEnumPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service.js';
import { CreateContentDto } from './dto/create-content.dto.js';
import { UpdateContentDto } from './dto/update-content.dto.js';
import { ContentCategory, UserRole } from '../generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get(':category')
  findPublished(
    @Param('category', new ParseEnumPipe(ContentCategory)) category: ContentCategory,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.content.findPublished(category, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }

  @Get(':category/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.content.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  listForAdmin(@Query('category') category?: ContentCategory, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.content.listForAdmin(category, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateContentDto) {
    return this.content.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.content.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.content.remove(id);
  }
}
