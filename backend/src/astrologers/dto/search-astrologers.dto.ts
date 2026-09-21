import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AstrologerBadge } from '../../generated/prisma/enums.js';

export class SearchAstrologersDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsEnum(AstrologerBadge)
  badge?: AstrologerBadge;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;
}
