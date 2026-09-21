import { IsDateString, IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Gender, ProfileRelation } from '../../generated/prisma/enums.js';

export class CreateProfileDto {
  @IsEnum(ProfileRelation)
  relation!: ProfileRelation;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'timeOfBirth must be in HH:mm 24-hour format' })
  timeOfBirth!: string;

  @IsString()
  @MaxLength(200)
  placeOfBirth!: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}
