import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  async listGovernoratesWithCounts() {
    const counts = await this.prisma.jobOffer.groupBy({
      by: ['governorateCode'],
      where: { status: 'PUBLISHED' },
      _count: { id: true },
    });

    const countMap = new Map(counts.map((c) => [c.governorateCode, c._count.id]));

    return TUNISIAN_GOVERNORATES.map((gov) => ({
      ...gov,
      activeOffersCount: countMap.get(gov.code) || 0,
    }));
  }

  async getGovernorateByCode(code: string) {
    const found = TUNISIAN_GOVERNORATES.find((g) => g.code === code);
    if (!found) {
      throw new NotFoundException(`Gouvernorat ${code} introuvable`);
    }

    const offersCount = await this.prisma.jobOffer.count({
      where: {
        governorateCode: code,
        status: 'PUBLISHED',
      },
    });

    return {
      ...found,
      activeOffersCount: offersCount,
    };
  }
}
