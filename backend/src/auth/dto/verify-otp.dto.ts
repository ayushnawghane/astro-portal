import { IsPhoneNumber, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber()
  phone!: string;

  @Length(6, 6)
  code!: string;
}
