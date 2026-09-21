import { IsEnum, IsString } from 'class-validator';
import { ConsultationType } from '../../generated/prisma/enums.js';

export class CreateConsultationDto {
  @IsString()
  astrologerId!: string;

  @IsEnum(ConsultationType)
  type!: ConsultationType;
}
