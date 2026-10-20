import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ReviewCompanyDto, UserActionDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Administration & Modération')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats/overview')
  @ApiOperation({ summary: 'Obtenir les statistiques nationales et KPIs de la plateforme' })
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('companies/pending')
  @ApiOperation({ summary: 'Lister les entreprises en attente de validation administrative' })
  async getPendingCompanies() {
    return this.adminService.getPendingCompanies();
  }

  @Patch('companies/:id/review')
  @ApiOperation({ summary: 'Valider (APPROVED) ou rejeter (REJECTED) une entreprise' })
  async reviewCompany(
    @CurrentUser('id') adminUserId: string,
    @Param('id') companyId: string,
    @Body() dto: ReviewCompanyDto,
  ) {
    return this.adminService.reviewCompany(adminUserId, companyId, dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Lister les utilisateurs inscrits (candidats et recruteurs)' })
  async listUsers(@Query('role') role?: UserRole) {
    return this.adminService.listUsers(role);
  }

  @Patch('users/:id/action')
  @ApiOperation({ summary: 'Action administrative sur un utilisateur (suspendre, supprimer)' })
  async handleUserAction(
    @CurrentUser('id') adminUserId: string,
    @Param('id') targetUserId: string,
    @Body() dto: UserActionDto,
  ) {
    return this.adminService.handleUserAction(adminUserId, targetUserId, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Consulter le journal d\'audit des actions sensibles' })
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(limit ? Number(limit) : 30);
  }
}
