import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import slugify from 'slugify';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewCompanyDto, UserActionDto, AdminUserAction } from './dto/admin.dto';
import { CompanyStatus, UserRole, OfferStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalCandidates,
      totalRecruiters,
      activeOffers,
      pendingCompanies,
      totalApplications,
      govOffers,
      topSkillsData,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.CANDIDATE } }),
      this.prisma.user.count({ where: { role: UserRole.RECRUITER } }),
      this.prisma.jobOffer.count({ where: { status: OfferStatus.PUBLISHED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.PENDING } }),
      this.prisma.application.count(),
      this.prisma.jobOffer.groupBy({
        by: ['governorateCode'],
        where: { status: OfferStatus.PUBLISHED },
        _count: { id: true },
      }),
      this.prisma.jobSkill.groupBy({
        by: ['skillId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Résolution des noms des compétences les plus demandées
    const skillIds = topSkillsData.map((s) => s.skillId);
    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds } },
    });
    const skillNameMap = new Map(skills.map((s) => [s.id, s.name]));

    const topSkills = topSkillsData.map((item) => ({
      name: skillNameMap.get(item.skillId) || 'Compétence',
      count: item._count.id,
    }));

    return {
      overview: {
        totalCandidates,
        totalRecruiters,
        activeOffers,
        pendingCompanies,
        totalApplications,
        averageApplicationsPerOffer: activeOffers > 0 ? (totalApplications / activeOffers).toFixed(1) : 0,
      },
      offersByGovernorate: govOffers.map((g) => ({
        governorateCode: g.governorateCode,
        count: g._count.id,
      })),
      topSkills,
    };
  }

  async getPendingCompanies() {
    return this.prisma.company.findMany({
      where: { status: CompanyStatus.PENDING },
      include: {
        user: { select: { email: true, phone: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewCompany(adminUserId: string, companyId: string, dto: ReviewCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { user: true },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable');
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { status: dto.status },
    });

    // Enregistrement dans le Journal d'Audit de Sécurité
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `COMPANY_${dto.status}`,
        resource: `Company:${companyId}`,
        details: {
          companyName: company.name,
          taxId: company.taxId,
          reason: dto.reason || 'Validation administrative RNE',
        },
      },
    });

    // Notification envoyée au recruteur
    const isApproved = dto.status === CompanyStatus.APPROVED;
    await this.prisma.notification.create({
      data: {
        userId: company.userId,
        title: isApproved ? 'Entreprise validée avec succès 🎉' : 'Dossier entreprise rejeté ⚠️',
        message: isApproved
          ? `Votre entreprise "${company.name}" a été validée. Vous pouvez désormais publier des offres et recevoir des candidatures.`
          : `Votre dossier pour "${company.name}" n'a pas été validé : ${dto.reason || 'Matricule fiscal non conforme'}.`,
        link: '/recruteur/pipeline',
      },
    });

    return updated;
  }

  async listUsers(role?: UserRole) {
    const where: any = {};
    if (role) where.role = role;

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        consentGdprAt: true,
        createdAt: true,
        candidate: { select: { firstName: true, lastName: true, headline: true } },
        company: { select: { name: true, taxId: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async handleUserAction(adminUserId: string, targetUserId: string, dto: UserActionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Impossible d\'altérer un compte administrateur');
    }

    // Journal d'audit
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `USER_${dto.action}`,
        resource: `User:${targetUserId}`,
        details: {
          targetEmail: user.email,
          reason: dto.reason || 'Action administrative',
        },
      },
    });

    if (dto.action === AdminUserAction.DELETE) {
      return this.prisma.user.delete({ where: { id: targetUserId } });
    }

    return { success: true, action: dto.action, user: user.email };
  }

  async getAuditLogs(limit: number = 30) {
    return this.prisma.auditLog.findMany({
      include: {
        user: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async runWebScraperImport(adminUserId: string, count: number = 4) {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const scraperRes = await fetch(`${aiUrl}/ai/scraper/run-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });

    if (!scraperRes.ok) {
      throw new BadRequestException('Erreur lors de la collecte automatique web');
    }

    const { jobs } = await scraperRes.json();
    const importedJobs = [];

    let partnerCompany = await this.prisma.company.findFirst({
      where: { name: 'Partenaires Emploi Tunisie (Web)' },
    });

    if (!partnerCompany) {
      partnerCompany = await this.prisma.company.create({
        data: {
          userId: adminUserId,
          name: 'Partenaires Emploi Tunisie (Web)',
          taxId: '9999999Z/Z/Z/999',
          sector: 'Collecte Automatique Web (Keejob / Tanitjobs)',
          size: 'Portail National',
          description: 'Offres indexées automatiquement via le scraper TuniJobs.',
          status: 'APPROVED',
        },
      });
    }

    for (const item of jobs) {
      const slug = `${slugify(item.title, { lower: true, strict: true })}-${Math.random().toString(36).substring(2, 7)}`;
      const govCode = item.governorate_code || '11';
      const govInfo =
        TUNISIAN_GOVERNORATES.find((g) => g.code === govCode) ||
        TUNISIAN_GOVERNORATES[0];

      const job = await this.prisma.jobOffer.create({
        data: {
          companyId: partnerCompany.id,
          title: `[Web] ${item.title} — ${item.company}`,
          slug,
          description: item.description,
          requirements: item.requirements,
          contractType: item.contract_type,
          workMode: item.work_mode,
          salaryMin: item.salary_min,
          salaryMax: item.salary_max,
          currency: item.currency || 'TND',
          governorateCode: govCode,
          latitude: govInfo.centerLat,
          longitude: govInfo.centerLng,
          status: OfferStatus.PUBLISHED,
          expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      });
      importedJobs.push(job);
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'WEB_SCRAPER_RUN',
        resource: 'JobOffer',
        details: { importedCount: importedJobs.length },
      },
    });

    return {
      success: true,
      importedCount: importedJobs.length,
      jobs: importedJobs,
    };
  }
}
