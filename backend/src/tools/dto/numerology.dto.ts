import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

export class NumerologyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName!: string;

  @IsDateString()
  dateOfBirth!: string;
}
