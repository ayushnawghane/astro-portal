import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ContentCategory } from '../../generated/prisma/enums.js';

export class CreateContentDto {
  @IsEnum(ContentCategory)
  category!: ContentCategory;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be lowercase, alphanumeric, hyphen-separated' })
  @MaxLength(150)
  slug!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(500)
  summary!: string;

  @IsString()
  body!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
