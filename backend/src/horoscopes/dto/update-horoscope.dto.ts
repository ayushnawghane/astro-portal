import { PartialType } from '@nestjs/mapped-types';
import { CreateHoroscopeDto } from './create-horoscope.dto.js';

export class UpdateHoroscopeDto extends PartialType(CreateHoroscopeDto) {}
