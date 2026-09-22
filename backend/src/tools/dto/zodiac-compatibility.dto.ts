import { IsIn } from 'class-validator';
import { WESTERN_SIGNS } from '../zodiac.util.js';

const SIGN_NAMES = WESTERN_SIGNS.map((s) => s.sign);

export class ZodiacCompatibilityDto {
  @IsIn(SIGN_NAMES)
  signA!: string;

  @IsIn(SIGN_NAMES)
  signB!: string;
}
