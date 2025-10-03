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
    const { notificationId, channels } = job.data;
    
    this.logger.log(`🔄 Procesando notificación ${notificationId} - Job ID: ${job.id}`);
    this.logger.log(`📋 Canales configurados: ${channels.join(', ')}`);
    
    try {
      // Obtener la notificación de la base de datos
      const notification = await this.notificationModel.findById(notificationId);
      if (!notification) {
        throw new Error(`Notificación ${notificationId} no encontrada`);
      }

      this.logger.log(`📨 Enviando notificación a ${notification.email} por canales: ${channels.join(', ')}`);

      // Verificar variables de entorno antes de procesar
      this.logEnvironmentVariables();

      // Procesar cada canal
      for (const channel of channels) {
        await this.processChannel(notification, channel);
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

  private async processChannel(notification: Notification, channel: string): Promise<void> {
    switch (channel) {
      case 'email':
        this.logger.log(`📧 Procesando email para ${notification.email}`);
        await this.mailerService.sendMail(
          {
            name: notification.name,
            email: notification.email,
            message: notification.message
          }
          // Ya no pasamos credentials, el servicio usa process.env directamente
        );
        this.logger.log(`✅ Email enviado exitosamente a ${notification.email}`);
        break;

      case 'telegram':
        this.logger.log(`📱 Procesando Telegram para ${notification.name}`);
        await this.telegramService.sendMessage(
          {
            name: notification.name,
            email: notification.email,
            message: notification.message
          }
          // Ya no pasamos credentials, el servicio usa process.env directamente
        );
        this.logger.log(`✅ Mensaje de Telegram enviado exitosamente a ${notification.name}`);
        break;

      default:
        this.logger.warn(`⚠️ Canal desconocido: ${channel}`);
        throw new Error(`Canal de notificación no soportado: ${channel}`);
    }
  }

  private logEnvironmentVariables(): void {
    this.logger.log(`🔍 Verificando variables de entorno:`);
    this.logger.log(`   - RESEND_KEY: ${process.env.RESEND_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    this.logger.log(`   - MAIL_TO: ${process.env.MAIL_TO ? '✅ Configurada' : '❌ No configurada'}`);
    this.logger.log(`   - TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Configurada' : '❌ No configurada'}`);
    this.logger.log(`   - TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID ? '✅ Configurada' : '❌ No configurada'}`);
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
