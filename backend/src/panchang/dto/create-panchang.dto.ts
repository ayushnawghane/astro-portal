import { IsDateString, IsLatitude, IsLongitude, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePanchangDto {
  @IsDateString()
  date!: string;

  @IsString()
  @MaxLength(120)
  location!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsString()
  tithi!: string;

  @IsString()
  nakshatra!: string;

  @IsString()
  yoga!: string;

  @IsString()
  karana!: string;

  @IsDateString()
  sunrise!: string;

  @IsDateString()
  sunset!: string;

  @IsOptional()
  @IsDateString()
  moonrise?: string;

  @IsOptional()
  @IsDateString()
  moonset?: string;

  @IsString()
  rahuKaal!: string;

  @IsString()
  gulikaKaal!: string;

  @IsString()
  yamaganda!: string;
}
