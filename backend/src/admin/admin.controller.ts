import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { SetUserRoleDto } from './dto/set-user-role.dto.js';
import { UserRole } from '../generated/prisma/enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('role') role?: UserRole) {
    return this.admin.listUsers({ page, pageSize, role });
  }

  @Patch('users/:id/role')
  setUserRole(@Param('id') id: string, @Body() dto: SetUserRoleDto) {
    return this.admin.setUserRole(id, dto.role);
  }

  @Get('astrologers')
  listAstrologers(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('isApproved') isApproved?: string) {
    return this.admin.listAstrologers({ page, pageSize, isApproved });
  }

  @Get('consultations')
  listConsultations(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('status') status?: string) {
    return this.admin.listConsultations({ page, pageSize, status });
  }

  @Get('wallet/transactions')
  listWalletTransactions(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.admin.listWalletTransactions({ page, pageSize });
  }

  @Get('revenue')
  revenue() {
    return this.admin.revenueDashboard();
  }
}
