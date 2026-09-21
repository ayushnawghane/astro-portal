import { IsIn, IsPhoneNumber } from 'class-validator';

export class RequestOtpDto {
  @IsPhoneNumber()
  phone!: string;

  @IsIn(['REGISTER', 'LOGIN'])
  purpose!: 'REGISTER' | 'LOGIN';
}
