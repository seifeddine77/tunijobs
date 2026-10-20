import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, CompanyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec cette adresse email');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Création de l'utilisateur avec son profil associé
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          role: dto.role,
          phone: dto.phone,
          isEmailVerified: false,
          consentGdprAt: new Date(),
        },
      });

      if (dto.role === UserRole.CANDIDATE) {
        await tx.candidateProfile.create({
          data: {
            userId: newUser.id,
            firstName: dto.firstName || 'Candidat',
            lastName: dto.lastName || 'Anonyme',
          },
        });
      } else if (dto.role === UserRole.RECRUITER) {
        await tx.company.create({
          data: {
            userId: newUser.id,
            name: dto.companyName || 'Mon Entreprise',
            taxId: dto.taxId || `${Math.floor(1000000 + Math.random() * 9000000)}A/A/M/000`,
            sector: 'Technologies de l\'information',
            size: '10-50',
            description: 'Entreprise inscrite sur TuniJobs',
            status: CompanyStatus.PENDING,
          },
        });
      }

      return newUser;
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        candidate: true,
        company: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Identifiants de connexion invalides');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants de connexion invalides');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        candidate: user.candidate,
        company: user.company,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_tunijobs_key_change_in_production_2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur introuvable');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (e) {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide ou expiré');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super_secret_jwt_tunijobs_key_change_in_production_2026',
        expiresIn: process.env.JWT_EXPIRATION || '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_tunijobs_key_change_in_production_2026',
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
