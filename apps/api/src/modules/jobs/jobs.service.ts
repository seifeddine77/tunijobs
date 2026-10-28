import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobStatusDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { OfferStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(userId: string, dto: CreateJobDto) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new ForbiddenException('Vous devez créer une entreprise avant de publier une offre');
    }

    // Vérifier que le gouvernorat existe
    const gov = await this.prisma.governorate.findUnique({
      where: { code: dto.governorateCode },
    });

    if (!gov) {
      throw new BadRequestException(`Gouvernorat introuvable avec le code ${dto.governorateCode}`);
    }

    // Générer un slug unique
    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${dto.governorateCode}-${uniqueSuffix}`;

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut

    // Création de l'offre
    const job = await this.prisma.jobOffer.create({
      data: {
        companyId: company.id,
        title: dto.title,
        slug,
        description: dto.description,
        requirements: dto.requirements,
        contractType: dto.contractType,
        workMode: dto.workMode,
        experienceLevel: dto.experienceLevel,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency || 'TND',
        status: dto.status || OfferStatus.PUBLISHED,
        governorateCode: dto.governorateCode,
        delegation: dto.delegation,
        latitude: dto.latitude,
        longitude: dto.longitude,
        expiresAt,
      },
      include: {
        company: true,
        governorate: true,
      },
    });

    // Lier les compétences
    if (dto.skills && dto.skills.length > 0) {
      for (const skillName of dto.skills) {
        const skill = await this.prisma.skill.upsert({
          where: { name: skillName.trim() },
          update: {},
          create: { name: skillName.trim() },
        });

        await this.prisma.jobSkill.create({
          data: {
            jobOfferId: job.id,
            skillId: skill.id,
            isMandatory: true,
          },
        });
      }
    }

    return job;
  }

  async listJobs(query: JobQueryDto) {
    const { q, governorate, contractType, workMode, minSalary, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JobOfferWhereInput = {
      status: OfferStatus.PUBLISHED,
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { requirements: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (governorate) {
      where.governorateCode = governorate;
    }

    if (contractType) {
      where.contractType = contractType;
    }

    if (workMode) {
      where.workMode = workMode;
    }

    if (minSalary) {
      where.salaryMax = { gte: minSalary };
    }

    const [items, total] = await Promise.all([
      this.prisma.jobOffer.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              sector: true,
            },
          },
          governorate: true,
          skills: {
            include: { skill: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobOffer.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChoroplethData() {
    const counts = await this.prisma.jobOffer.groupBy({
      by: ['governorateCode'],
      where: { status: OfferStatus.PUBLISHED },
      _count: { id: true },
    });

    const data: Record<string, number> = {};
    let max = 0;

    for (const c of counts) {
      data[c.governorateCode] = c._count.id;
      if (c._count.id > max) {
        max = c._count.id;
      }
    }

    return {
      counts: data,
      max: max > 0 ? max : 1,
    };
  }

  async getGeoJsonPoints(query: JobQueryDto) {
    const { items } = await this.listJobs({ ...query, limit: 1000 });

    return {
      type: 'FeatureCollection',
      features: items.map((job) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [job.longitude, job.latitude],
        },
        properties: {
          id: job.id,
          title: job.title,
          slug: job.slug,
          companyName: job.company?.name || 'Entreprise',
          companyLogo: job.company?.logoUrl || null,
          contractType: job.contractType,
          workMode: job.workMode,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          governorateCode: job.governorateCode,
          governorateName: job.governorate?.nameFr || '',
          delegation: job.delegation,
        },
      })),
    };
  }

  async getNearMe(lat: number, lng: number, radiusKm: number = 30) {
    try {
      // 1. Requête spatiale native PostGIS optimisée par index
      const radiusMeters = radiusKm * 1000;
      const rawResults: any[] = await this.prisma.$queryRaw`
        SELECT 
          j.id, j.title, j.slug, j."contractType", j."workMode", j."experienceLevel",
          j."salaryMin", j."salaryMax", j.currency, j.status, j."governorateCode",
          j.delegation, j.latitude, j.longitude, j."createdAt", j."companyId",
          ROUND((ST_Distance(
            ST_SetSRID(ST_MakePoint(j.longitude, j.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) / 1000.0)::numeric, 1) as "distanceKm",
          json_build_object(
            'id', c.id,
            'name', c.name,
            'logoUrl', c."logoUrl",
            'sector', c.sector
          ) as company,
          json_build_object(
            'code', g.code,
            'nameFr', g."nameFr",
            'nameAr', g."nameAr"
          ) as governorate
        FROM "JobOffer" j
        JOIN "Company" c ON j."companyId" = c.id
        JOIN "Governorate" g ON j."governorateCode" = g.code
        WHERE j.status = 'PUBLISHED'
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(j.longitude, j.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY "distanceKm" ASC
        LIMIT 50;
      `;

      if (rawResults && Array.isArray(rawResults)) {
        return rawResults.map((r) => ({
          ...r,
          distanceKm: Number(r.distanceKm),
        }));
      }
    } catch (spatialErr) {
      // Fallback automatique Haversine (ex: environnement de test unitaire Jest sans PostGIS natif)
    }

    // Fallback Haversine
    const offers = await this.prisma.jobOffer.findMany({
      where: { status: OfferStatus.PUBLISHED },
      include: {
        company: true,
        governorate: true,
      },
    });

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const withDistance = offers
      .map((job) => {
        const dLat = deg2rad(job.latitude - lat);
        const dLon = deg2rad(job.longitude - lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat)) * Math.cos(deg2rad(job.latitude)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = 6371 * c; // Rayon moyen de la Terre en km
        return {
          ...job,
          distanceKm: Math.round(distanceKm * 10) / 10,
        };
      })
      .filter((job) => job.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return withDistance;
  }

  async getJobBySlug(slug: string) {
    const job = await this.prisma.jobOffer.findUnique({
      where: { slug },
      include: {
        company: true,
        governorate: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Offre d\'emploi introuvable');
    }

    // Incrémenter les vues
    await this.prisma.jobOffer.update({
      where: { id: job.id },
      data: { viewsCount: { increment: 1 } },
    });

    return job;
  }

  async updateStatus(userId: string, jobId: string, dto: UpdateJobStatusDto) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new ForbiddenException('Non autorisé');
    }

    const job = await this.prisma.jobOffer.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Offre introuvable');
    }

    if (job.companyId !== company.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que les offres de votre entreprise');
    }

    return this.prisma.jobOffer.update({
      where: { id: jobId },
      data: { status: dto.status },
    });
  }

  async deleteJob(userId: string, jobId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new ForbiddenException('Non autorisé');
    }

    const job = await this.prisma.jobOffer.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Offre introuvable');
    }

    if (job.companyId !== company.id) {
      throw new ForbiddenException('Vous ne pouvez supprimer que les offres de votre entreprise');
    }

    return this.prisma.jobOffer.delete({
      where: { id: jobId },
    });
  }
}
