import { PartialType } from '@nestjs/mapped-types';
import { CreatePanchangDto } from './create-panchang.dto.js';

export class UpdatePanchangDto extends PartialType(CreatePanchangDto) {}
