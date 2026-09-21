import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserRole } from '../../generated/prisma/enums.js';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

interface RequestWithUser {
  user: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});
