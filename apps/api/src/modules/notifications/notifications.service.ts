import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async notifyApplicationReceived(params: {
    recruiterUserId: string;
    candidateName: string;
    jobTitle: string;
    applicationId: string;
  }) {
    try {
      await this.notificationsQueue.add('application-received', params);
    } catch (e) {
      this.logger.error('Erreur ajout job BullMQ application-received:', e);
      // Fallback direct en DB si Redis inaccessible
      await this.prisma.notification.create({
        data: {
          userId: params.recruiterUserId,
          title: 'Nouvelle candidature reçue 📄',
          message: `${params.candidateName} a postulé à votre offre "${params.jobTitle}".`,
          link: `/recruteur/candidatures/${params.applicationId}`,
        },
      });
    }
  }

  async notifyStatusChanged(params: {
    candidateUserId: string;
    jobTitle: string;
    newStatus: string;
    companyName: string;
  }) {
    try {
      await this.notificationsQueue.add('status-changed', params);
    } catch (e) {
      this.logger.error('Erreur ajout job BullMQ status-changed:', e);
      await this.prisma.notification.create({
        data: {
          userId: params.candidateUserId,
          title: `Mise à jour de votre candidature — ${params.companyName}`,
          message: `Votre candidature pour "${params.jobTitle}" est désormais ${params.newStatus}.`,
          link: '/candidat/candidatures',
        },
      });
    }
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
