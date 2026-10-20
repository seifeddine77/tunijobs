import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobStatusDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Offres d\'emploi')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Recherche et filtrage multi-critères des offres d\'emploi' })
  async listJobs(@Query() query: JobQueryDto) {
    return this.jobsService.listJobs(query);
  }

  @Public()
  @Get('geo/choropleth')
  @ApiOperation({ summary: 'Obtenir les données de choroplèthe par gouvernorat' })
  async getChoropleth() {
    return this.jobsService.getChoroplethData();
  }

  @Public()
  @Get('geo/points')
  @ApiOperation({ summary: 'Obtenir les offres sous forme de GeoJSON pour MapLibre GL' })
  async getGeoJsonPoints(@Query() query: JobQueryDto) {
    return this.jobsService.getGeoJsonPoints(query);
  }

  @Public()
  @Get('geo/near-me')
  @ApiOperation({ summary: 'Recherche géolocalisée d\'offres proches d\'une position GPS' })
  async getNearMe(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radiusKm') radiusKm?: number,
  ) {
    return this.jobsService.getNearMe(Number(lat), Number(lng), radiusKm ? Number(radiusKm) : 30);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Consulter le détail d\'une offre par son slug unique' })
  async getBySlug(@Param('slug') slug: string) {
    return this.jobsService.getJobBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Publier une nouvelle offre d\'emploi en Tunisie' })
  async createJob(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.createJob(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut d\'une offre (PUBLISHED, DRAFT, CLOSED)' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une offre d\'emploi' })
  async deleteJob(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.jobsService.deleteJob(userId, id);
  }
}
