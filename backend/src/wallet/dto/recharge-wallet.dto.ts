import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RechargeWalletDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
