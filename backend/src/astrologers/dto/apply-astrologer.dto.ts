import { ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class ApplyAstrologerDto {
  @IsString()
  @MaxLength(120)
  displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsInt()
  @Min(0)
  experienceYears!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  expertise!: string[];

  @IsNumber()
  @Min(0)
  pricePerMinuteChat!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerMinuteVoice?: number;
}
