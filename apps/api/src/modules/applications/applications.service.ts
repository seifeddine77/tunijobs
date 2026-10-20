import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplyJobDto, UpdateApplicationStatusDto, AddApplicationNoteDto } from './dto/apply-job.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async applyToJob(candidateUserId: string, jobOfferId: string, dto: ApplyJobDto) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
      include: { skills: { include: { skill: true } } },
    });

    if (!candidate) {
      throw new BadRequestException('Veuillez compléter votre profil candidat avant de postuler');
    }

    const job = await this.prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
      include: {
        company: { include: { user: true } },
        skills: { include: { skill: true } },
      },
    });

    if (!job) {
      throw new NotFoundException('Offre d\'emploi introuvable');
    }

    // Vérifier si déjà postulé
    const existing = await this.prisma.application.findUnique({
      where: {
        candidateId_jobOfferId: {
          candidateId: candidate.id,
          jobOfferId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Vous avez déjà postulé à cette offre');
    }

    // Appel au Microservice IA (FastAPI) pour le matching hybride et l'explication
    let aiScore = 75;
    let aiStrengths = ['Profil motivé et qualifié'];
    let aiMissing: string[] = [];
    let aiExplanation = 'Correspondance globale basée sur vos compétences clés.';

    try {
      const aiPayload = {
        candidate: {
          headline: candidate.headline,
          experience_years: candidate.experienceYears,
          skills: candidate.skills.map((s) => s.skill.name),
          preferred_governorates: candidate.preferredGovernorates,
          summary: candidate.bio,
        },
        job: {
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          skills: job.skills.map((s) => s.skill.name),
          contract_type: job.contractType,
          work_mode: job.workMode,
          governorate_code: job.governorateCode,
          min_experience_years: job.experienceLevel.includes('Senior') ? 5 : job.experienceLevel.includes('Confirmé') ? 3 : 1,
        },
      };

      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiRes = await fetch(`${aiUrl}/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiScore = Math.round(aiData.score);
        aiStrengths = aiData.strengths || [];
        aiMissing = aiData.missing_skills || [];
        aiExplanation = aiData.explanation || aiExplanation;
      }
    } catch (e) {
      // Fallback gracieux si microservice temporairement occupé
    }

    const application = await this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobOfferId,
        coverLetter: dto.coverLetter,
        status: ApplicationStatus.RECEIVED,
        aiScore,
        aiStrengths,
        aiMissing,
        aiExplanation,
      },
      include: {
        jobOffer: { include: { company: true } },
        candidate: true,
      },
    });

    // Déclencher la notification asynchrone BullMQ pour le recruteur
    await this.notificationsService.notifyApplicationReceived({
      recruiterUserId: job.company.userId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jobTitle: job.title,
      applicationId: application.id,
    });

    return application;
  }

  async getCandidateApplications(candidateUserId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
    });

    if (!candidate) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    return this.prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: {
        jobOffer: {
          include: {
            company: { select: { id: true, name: true, logoUrl: true, sector: true } },
            governorate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecruiterJobKanban(recruiterUserId: string, jobOfferId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId: recruiterUserId },
    });

    if (!company) {
      throw new ForbiddenException('Compte recruteur introuvable');
    }

    const job = await this.prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
    });

    if (!job) {
      throw new NotFoundException('Offre introuvable');
    }

    if (job.companyId !== company.id) {
      throw new ForbiddenException('Vous n\'avez pas accès aux candidatures de cette offre');
    }

    const applications = await this.prisma.application.findMany({
      where: { jobOfferId },
      include: {
        candidate: {
          include: {
            skills: { include: { skill: true } },
            educations: true,
            experiences: true,
            user: { select: { email: true, phone: true } },
          },
        },
        notes: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { aiScore: 'desc' },
    });

    // Structuration en colonnes Kanban
    const kanban: Record<ApplicationStatus, typeof applications> = {
      RECEIVED: [],
      SCREENED: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
    };

    for (const app of applications) {
      kanban[app.status].push(app);
    }

    return {
      job: {
        id: job.id,
        title: job.title,
        slug: job.slug,
        status: job.status,
      },
      kanban,
      total: applications.length,
    };
  }

  async updateApplicationStatus(
    recruiterUserId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { userId: recruiterUserId },
    });

    if (!company) {
      throw new ForbiddenException('Non autorisé');
    }

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: true,
        candidate: { select: { userId: true, firstName: true, lastName: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }

    if (application.jobOffer.companyId !== company.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que les candidatures de votre entreprise');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
    });

    // Déclencher la notification asynchrone BullMQ pour le candidat
    await this.notificationsService.notifyStatusChanged({
      candidateUserId: application.candidate.userId,
      jobTitle: application.jobOffer.title,
      newStatus: dto.status,
      companyName: company.name,
    });

    return updated;
  }

  async addNote(
    recruiterUserId: string,
    applicationId: string,
    dto: AddApplicationNoteDto,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { userId: recruiterUserId },
    });

    if (!company) {
      throw new ForbiddenException('Non autorisé');
    }

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobOffer: true },
    });

    if (!application || application.jobOffer.companyId !== company.id) {
      throw new ForbiddenException('Candidature introuvable ou non autorisée');
    }

    return this.prisma.applicationNote.create({
      data: {
        applicationId,
        authorId: recruiterUserId,
        content: dto.content,
      },
    });
  }

  // --- Gestion des favoris (Saved Jobs) ---
  async saveJob(candidateUserId: string, jobOfferId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
    });

    if (!candidate) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    return this.prisma.savedJob.upsert({
      where: {
        candidateId_jobOfferId: {
          candidateId: candidate.id,
          jobOfferId,
        },
      },
      update: {},
      create: {
        candidateId: candidate.id,
        jobOfferId,
      },
    });
  }

  async unsaveJob(candidateUserId: string, jobOfferId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
    });

    if (!candidate) return;

    return this.prisma.savedJob.deleteMany({
      where: {
        candidateId: candidate.id,
        jobOfferId,
      },
    });
  }

  async getSavedJobs(candidateUserId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
    });

    if (!candidate) {
      throw new NotFoundException('Profil introuvable');
    }

    return this.prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
      include: {
        jobOffer: {
          include: {
            company: true,
            governorate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
