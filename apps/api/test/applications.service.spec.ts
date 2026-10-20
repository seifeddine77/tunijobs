jest.mock('../src/modules/notifications/notifications.service', () => ({
  NotificationsService: class MockNotificationsService {
    notifyApplicationReceived = jest.fn().mockResolvedValue(undefined);
    notifyStatusChanged = jest.fn().mockResolvedValue(undefined);
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../src/modules/applications/applications.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockPrismaService = {
    candidateProfile: {
      findUnique: jest.fn(),
    },
    jobOffer: {
      findUnique: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
    applicationNote: {
      create: jest.fn(),
    },
  };

  const mockNotificationsService = {
    notifyApplicationReceived: jest.fn().mockResolvedValue(undefined),
    notifyStatusChanged: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject duplicate application to the same job', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValueOnce({
      id: 'cand-1',
      userId: 'user-1',
      skills: [],
    });

    mockPrismaService.jobOffer.findUnique.mockResolvedValueOnce({
      id: 'job-1',
      title: 'Dev NestJS',
      company: { userId: 'recruiter-1' },
      skills: [],
    });

    // Déjà postulé
    mockPrismaService.application.findUnique.mockResolvedValueOnce({
      id: 'app-1',
      candidateId: 'cand-1',
      jobOfferId: 'job-1',
    });

    await expect(
      service.applyToJob('user-1', 'job-1', {}),
    ).rejects.toThrow(ConflictException);
  });

  it('should prevent recruiter from accessing Kanban of a job belonging to another company', async () => {
    mockPrismaService.company.findUnique.mockResolvedValueOnce({
      id: 'company-vermeg',
      userId: 'recruiter-vermeg',
    });

    mockPrismaService.jobOffer.findUnique.mockResolvedValueOnce({
      id: 'job-telnet',
      companyId: 'company-telnet', // Autre entreprise
    });

    await expect(
      service.getRecruiterJobKanban('recruiter-vermeg', 'job-telnet'),
    ).rejects.toThrow(ForbiddenException);
  });
});
