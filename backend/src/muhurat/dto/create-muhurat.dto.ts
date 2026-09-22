import { ArrayMinSize, IsArray, IsDateString, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MUHURAT_ACTIVITIES } from '../../common/muhurat-activities.js';

class TimingWindowDto {
  @IsString()
  start!: string;

  @IsString()
  end!: string;

  @IsString()
  quality!: string;
}

export class CreateMuhuratDto {
  @IsIn(MUHURAT_ACTIVITIES)
  activityType!: string;

  @IsDateString()
  date!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TimingWindowDto)
  timings!: TimingWindowDto[];
}
