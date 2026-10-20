import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateCandidateProfileDto,
  AddSkillDto,
  CreateExperienceDto,
  CreateEducationDto,
} from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Candidats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('candidates')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Roles(UserRole.CANDIDATE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtenir le profil complet du candidat connecté' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getCandidateProfile(userId);
  }

  @Put('profile')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Mettre à jour les informations du profil candidat' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCandidateProfileDto,
  ) {
    return this.usersService.updateCandidateProfile(userId, dto);
  }

  @Post('skills')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Ajouter une compétence au profil du candidat' })
  async addSkill(@CurrentUser('id') userId: string, @Body() dto: AddSkillDto) {
    return this.usersService.addSkill(userId, dto);
  }

  @Delete('skills/:skillId')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Supprimer une compétence du profil' })
  async removeSkill(
    @CurrentUser('id') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.usersService.removeSkill(userId, skillId);
  }

  @Post('experiences')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Ajouter une expérience professionnelle' })
  async addExperience(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.usersService.addExperience(userId, dto);
  }

  @Delete('experiences/:id')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Supprimer une expérience professionnelle' })
  async removeExperience(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.removeExperience(userId, id);
  }

  @Post('educations')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Ajouter une formation ou diplôme' })
  async addEducation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEducationDto,
  ) {
    return this.usersService.addEducation(userId, dto);
  }

  @Delete('educations/:id')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Supprimer une formation ou diplôme' })
  async removeEducation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.removeEducation(userId, id);
  }

  @Post('cv/parse')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Analyser un CV par IA et pré-remplir automatiquement le profil' })
  async parseCv(
    @CurrentUser('id') userId: string,
    @Body('rawText') rawText: string,
  ) {
    return this.usersService.parseAndApplyCv(userId, rawText);
  }

  @Get('export-data')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Conformité INPDP (Loi 2004-63) : Exporter l\'intégralité des données personnelles' })
  async exportData(@CurrentUser('id') userId: string) {
    return this.usersService.exportCandidateData(userId);
  }

  @Delete('account')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Conformité INPDP (Loi 2004-63) : Droit à l\'oubli et suppression définitive du compte' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteCandidateAccount(userId);
  }
}
