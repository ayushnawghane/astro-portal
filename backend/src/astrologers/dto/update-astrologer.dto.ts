import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApplyAstrologerDto } from './apply-astrologer.dto.js';

export class UpdateAstrologerDto extends PartialType(ApplyAstrologerDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
