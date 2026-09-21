import { IsEnum } from 'class-validator';
import { UserRole } from '../../generated/prisma/enums.js';

export class SetUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
