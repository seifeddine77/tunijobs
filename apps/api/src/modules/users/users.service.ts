import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateProfileDto, AddSkillDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCandidateProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: { skill: true },
        },
        educations: true,
        experiences: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    return profile;
  }

  async updateCandidateProfile(userId: string, dto: UpdateCandidateProfileDto) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    return this.prisma.candidateProfile.update({
      where: { userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        headline: dto.headline,
        bio: dto.bio,
        experienceYears: dto.experienceYears,
        currentSalary: dto.currentSalary,
        expectedSalary: dto.expectedSalary,
        preferredGovernorates: dto.preferredGovernorates,
      },
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async addSkill(userId: string, dto: AddSkillDto) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    // Trouver ou créer la compétence
    const skill = await this.prisma.skill.upsert({
      where: { name: dto.name.trim() },
      update: {},
      create: { name: dto.name.trim(), category: 'Général' },
    });

    // Lier au candidat
    return this.prisma.candidateSkill.upsert({
      where: {
        candidateId_skillId: {
          candidateId: profile.id,
          skillId: skill.id,
        },
      },
      update: { level: dto.level },
      create: {
        candidateId: profile.id,
        skillId: skill.id,
        level: dto.level,
      },
      include: { skill: true },
    });
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    return this.prisma.candidateSkill.delete({
      where: {
        candidateId_skillId: {
          candidateId: profile.id,
          skillId,
        },
      },
    });
  }

  async parseAndApplyCv(userId: string, rawText: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiRes = await fetch(`${aiUrl}/ai/parse-cv-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
    });

    if (!aiRes.ok) {
      throw new Error('Erreur lors du parsing IA du CV');
    }

    const parsed = await aiRes.json();

    // Mettre à jour le profil avec les données extraites
    const updated = await this.prisma.candidateProfile.update({
      where: { userId },
      data: {
        firstName: parsed.personal_info?.first_name || profile.firstName,
        lastName: parsed.personal_info?.last_name || profile.lastName,
        headline: parsed.headline || profile.headline,
        bio: parsed.summary || profile.bio,
        experienceYears: parsed.experience_years || profile.experienceYears,
        cvParsedText: rawText.substring(0, 5000),
        rawCvJson: parsed,
      },
    });

    // Lier les compétences extraites par l'IA
    if (parsed.skills && parsed.skills.length > 0) {
      for (const skillName of parsed.skills) {
        const skill = await this.prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName, category: 'Informatique & Tech' },
        });

        await this.prisma.candidateSkill.upsert({
          where: {
            candidateId_skillId: {
              candidateId: profile.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            candidateId: profile.id,
            skillId: skill.id,
            level: 'Confirmé',
          },
        });
      }
    }

    return this.getCandidateProfile(userId);
  }

  async exportCandidateData(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        educations: true,
        experiences: true,
        applications: {
          include: {
            jobOffer: {
              select: {
                title: true,
                slug: true,
                company: { select: { name: true } },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            consentGdprAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    return {
      legalNotice:
        'Conformité Loi Organique n° 2004-63 du 27 juillet 2004 portant sur la protection des données à caractère personnel (INPDP Tunisie)',
      exportTimestamp: new Date().toISOString(),
      user: profile.user,
      profile: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline,
        bio: profile.bio,
        experienceYears: profile.experienceYears,
        currentSalary: profile.currentSalary,
        expectedSalary: profile.expectedSalary,
        currency: profile.currency,
        preferredGovernorates: profile.preferredGovernorates,
        cvFileUrl: profile.cvFileUrl,
        rawCvJson: profile.rawCvJson,
        createdAt: profile.createdAt,
      },
      skills: profile.skills.map((s) => ({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level,
      })),
      educations: profile.educations,
      experiences: profile.experiences,
      applications: profile.applications.map((app) => ({
        id: app.id,
        jobTitle: app.jobOffer.title,
        company: app.jobOffer.company.name,
        status: app.status,
        aiScore: app.aiScore,
        createdAt: app.createdAt,
      })),
    };
  }

  async deleteCandidateAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message:
        'Compte et données personnelles supprimés avec succès conformément à la loi n° 2004-63 (INPDP)',
    };
  }
}
