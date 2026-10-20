import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Traitement du job BullMQ [${job.name}] (ID: ${job.id})`);

    switch (job.name) {
      case 'application-received': {
        const { recruiterUserId, candidateName, jobTitle, applicationId } = job.data;

        // Créer une notification en base de données pour le recruteur
        await this.prisma.notification.create({
          data: {
            userId: recruiterUserId,
            title: 'Nouvelle candidature reçue 📄',
            message: `${candidateName} a postulé à votre offre "${jobTitle}".`,
            link: `/recruteur/candidatures/${applicationId}`,
          },
        });

        this.logger.log(`📧 [EMAIL SIMULATION] Envoi d'un email au recruteur (${recruiterUserId}) : Nouvelle candidature de ${candidateName}`);
        return { success: true };
      }

      case 'status-changed': {
        const { candidateUserId, jobTitle, newStatus, companyName } = job.data;

        const statusLabels: Record<string, string> = {
          SCREENED: 'présélectionnée 🔍',
          INTERVIEW: 'retenue pour un entretien 🗓️',
          OFFER: 'acceptée avec une proposition d\'embauche 🎉',
          REJECTED: 'non retenue pour ce poste',
        };

        const statusLabel = statusLabels[newStatus] || newStatus;

        // Créer une notification pour le candidat
        await this.prisma.notification.create({
          data: {
            userId: candidateUserId,
            title: `Mise à jour de votre candidature — ${companyName}`,
            message: `Votre candidature pour le poste "${jobTitle}" est désormais ${statusLabel}.`,
            link: '/candidat/candidatures',
          },
        });

        this.logger.log(`📧 [EMAIL SIMULATION] Envoi d'un email au candidat (${candidateUserId}) : Candidature ${jobTitle} mise à jour (${newStatus})`);
        return { success: true };
      }

      default:
        this.logger.warn(`Job inconnu : ${job.name}`);
        return { unhandled: true };
    }
  }
}
