import { IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { HoroscopeType } from '../../generated/prisma/enums.js';
import { ZODIAC_SIGNS } from '../../common/zodiac-signs.js';

export class CreateHoroscopeDto {
  @IsIn(ZODIAC_SIGNS)
  zodiacSign!: string;

  @IsEnum(HoroscopeType)
  type!: HoroscopeType;

  @IsDateString()
  date!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  luckyColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  luckyNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  luckyTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  luckyDirection?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  luckyGemstone?: string;
}
