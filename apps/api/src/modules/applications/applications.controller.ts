import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { ApplyJobDto, UpdateApplicationStatusDto, AddApplicationNoteDto } from './dto/apply-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Candidatures & Pipeline Recruteur')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // --- Actions Candidat ---
  @Post('jobs/:id/apply')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Postuler en 1 clic à une offre d\'emploi avec son profil TuniJobs' })
  async apply(
    @CurrentUser('id') userId: string,
    @Param('id') jobId: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.applicationsService.applyToJob(userId, jobId, dto);
  }

  @Post('jobs/:id/save')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Sauvegarder une offre dans ses favoris' })
  async saveJob(
    @CurrentUser('id') userId: string,
    @Param('id') jobId: string,
  ) {
    return this.applicationsService.saveJob(userId, jobId);
  }

  @Delete('jobs/:id/save')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Retirer une offre des favoris' })
  async unsaveJob(
    @CurrentUser('id') userId: string,
    @Param('id') jobId: string,
  ) {
    return this.applicationsService.unsaveJob(userId, jobId);
  }

  @Get('candidat/applications')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Suivi des candidatures du candidat connecté' })
  async getMyApplications(@CurrentUser('id') userId: string) {
    return this.applicationsService.getCandidateApplications(userId);
  }

  @Get('candidat/saved-jobs')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Consulter ses offres sauvegardées' })
  async getMySavedJobs(@CurrentUser('id') userId: string) {
    return this.applicationsService.getSavedJobs(userId);
  }

  // --- Actions Recruteur & Pipeline Kanban ---
  @Get('recruiter/jobs/:id/applications')
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Obtenir le pipeline Kanban des candidats pour une offre' })
  async getJobKanban(
    @CurrentUser('id') userId: string,
    @Param('id') jobId: string,
  ) {
    return this.applicationsService.getRecruiterJobKanban(userId, jobId);
  }

  @Patch('applications/:id/status')
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Déplacer une candidature dans le pipeline Kanban (changement de statut)' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(userId, id, dto);
  }

  @Post('applications/:id/notes')
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Ajouter une note interne d\'évaluation sur un candidat' })
  async addNote(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddApplicationNoteDto,
  ) {
    return this.applicationsService.addNote(userId, id, dto);
  }
}
