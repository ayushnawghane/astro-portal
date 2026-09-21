import { IsEnum } from 'class-validator';
import { AstrologerBadge } from '../../generated/prisma/enums.js';

export class SetBadgeDto {
  @IsEnum(AstrologerBadge)
  badge!: AstrologerBadge;
}
