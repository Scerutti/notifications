import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationStatus } from '../domain/notification.schema';
import { MailerService } from '../infrastructure/mailer.service';
import { TelegramService } from '../infrastructure/telegram.service';

export interface NotificationJobData {
  notificationId: string;
  owner: string;
  channels: string[];
  config: {
    email?: any;
    telegram?: any;
  };
}

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly mailerService: MailerService,
    private readonly telegramService: TelegramService
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, channels, config } = job.data;
    
    this.logger.log(`🔄 Procesando notificación ${notificationId} - Job ID: ${job.id}`);
    
    try {
      // Obtener la notificación de la base de datos
      const notification = await this.notificationModel.findById(notificationId);
      if (!notification) {
        throw new Error(`Notificación ${notificationId} no encontrada`);
      }

      this.logger.log(`📨 Enviando notificación a ${notification.email} por canales: ${channels.join(', ')}`);

      // Procesar cada canal
      for (const channel of channels) {
        await this.processChannel(notification, channel, config);
      }

      // Marcar como enviada
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await notification.save();

      this.logger.log(`✅ Notificación ${notificationId} procesada exitosamente`);

    } catch (error) {
      this.logger.error(`❌ Error procesando notificación ${notificationId}: ${error.message}`);
      
      // Actualizar notificación con error
      await this.updateNotificationWithError(notificationId, error.message);
      
      throw error; // Re-throw para que BullMQ maneje el reintento
    }
  }

  private async processChannel(notification: Notification, channel: string, config: any): Promise<void> {
    switch (channel) {
      case 'email':
        await this.mailerService.sendMail(
          {
            name: notification.name,
            email: notification.email,
            message: notification.message
          },
          config.email
        );
        this.logger.log(`📧 Email enviado a ${notification.email}`);
        break;

      case 'telegram':
        await this.telegramService.sendMessage(
          {
            name: notification.name,
            email: notification.email,
            message: notification.message
          },
          config.telegram
        );
        this.logger.log(`📱 Mensaje de Telegram enviado a ${notification.name}`);
        break;

      default:
        this.logger.warn(`⚠️ Canal desconocido: ${channel}`);
        throw new Error(`Canal de notificación no soportado: ${channel}`);
    }
  }

  private async updateNotificationWithError(notificationId: string, errorMessage: string): Promise<void> {
    try {
      await this.notificationModel.findByIdAndUpdate(notificationId, {
        status: NotificationStatus.FAILED,
        errorMessage,
        $inc: { retryCount: 1 }
      });
    } catch (error) {
      this.logger.error(`Error actualizando notificación ${notificationId}: ${error.message}`);
    }
  }
}
