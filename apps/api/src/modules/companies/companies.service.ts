import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-company.dto';
import { CompanyStatus } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async createCompany(userId: string, dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findFirst({
      where: {
        OR: [
          { userId },
          { taxId: dto.taxId.trim() },
        ],
      },
    });

    if (existing) {
      if (existing.userId === userId) {
        throw new BadRequestException('Vous avez déjà enregistré une entreprise');
      }
      throw new BadRequestException('Ce matricule fiscal est déjà utilisé par une autre entreprise');
    }

    return this.prisma.company.create({
      data: {
        userId,
        name: dto.name,
        taxId: dto.taxId.trim(),
        sector: dto.sector,
        size: dto.size,
        website: dto.website,
        description: dto.description || '',
        logoUrl: dto.logoUrl,
        status: CompanyStatus.PENDING,
      },
    });
  }

  async getMyCompany(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      include: {
        offers: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            contractType: true,
            createdAt: true,
            _count: { select: { applications: true } },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Aucune entreprise rattachée à ce compte recruteur');
    }

    return company;
  }

  async updateMyCompany(userId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable');
    }

    return this.prisma.company.update({
      where: { userId },
      data: dto,
    });
  }

  async getCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        offers: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            contractType: true,
            workMode: true,
            governorate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable');
    }

    return company;
  }

  async listApprovedCompanies() {
    return this.prisma.company.findMany({
      where: { status: CompanyStatus.APPROVED },
      select: {
        id: true,
        name: true,
        sector: true,
        size: true,
        logoUrl: true,
        website: true,
        _count: { select: { offers: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
