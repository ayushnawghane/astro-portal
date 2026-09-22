import { PartialType } from '@nestjs/mapped-types';
import { CreateMuhuratDto } from './create-muhurat.dto.js';

export class UpdateMuhuratDto extends PartialType(CreateMuhuratDto) {}
