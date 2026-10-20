import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../src/modules/admin/admin.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { CompanyStatus, UserRole } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminUserAction } from '../src/modules/admin/dto/admin.dto';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: {
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    company: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    jobOffer: {
      count: jest.fn().mockResolvedValue(5),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    application: {
      count: jest.fn().mockResolvedValue(15),
    },
    jobSkill: {
      groupBy: jest.fn().mockResolvedValue([]),
    },
    skill: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return aggregated dashboard statistics', async () => {
    const stats = await service.getDashboardStats();
    expect(stats.overview).toBeDefined();
    expect(stats.overview.totalCandidates).toBe(10);
    expect(stats.overview.activeOffers).toBe(5);
  });

  it('should approve a company and write to AuditLog', async () => {
    mockPrismaService.company.findUnique.mockResolvedValueOnce({
      id: 'comp-1',
      name: 'Vermeg',
      taxId: '1234567A/A/M/000',
      userId: 'recruiter-1',
    });

    mockPrismaService.company.update.mockResolvedValueOnce({
      id: 'comp-1',
      status: CompanyStatus.APPROVED,
    });

    const res = await service.reviewCompany('admin-1', 'comp-1', {
      status: CompanyStatus.APPROVED,
      reason: 'Conforme RNE',
    });

    expect(res.status).toBe(CompanyStatus.APPROVED);
    expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'COMPANY_APPROVED',
        }),
      }),
    );
  });

  it('should prevent altering an administrator account', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce({
      id: 'admin-super',
      email: 'admin@tunijobs.tn',
      role: UserRole.ADMIN,
    });

    await expect(
      service.handleUserAction('admin-1', 'admin-super', {
        action: AdminUserAction.DELETE,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
