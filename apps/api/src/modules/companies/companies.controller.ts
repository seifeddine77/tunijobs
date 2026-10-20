import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Entreprises')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister les entreprises validées par l\'administration' })
  async listApproved() {
    return this.companiesService.listApprovedCompanies();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir la fiche publique d\'une entreprise et ses offres' })
  async getById(@Param('id') id: string) {
    return this.companiesService.getCompanyById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBearerAuth()
  @Get('me/dashboard')
  @ApiOperation({ summary: 'Obtenir les données de l\'entreprise du recruteur connecté' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.companiesService.getMyCompany(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Créer le profil entreprise avec Matricule Fiscal' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.createCompany(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBearerAuth()
  @Put('me')
  @ApiOperation({ summary: 'Mettre à jour les informations de son entreprise' })
  async update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateMyCompany(userId, dto);
  }
}
