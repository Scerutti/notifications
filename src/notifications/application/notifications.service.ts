import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../domain/notification.schema';
import { MailerService } from '../infrastructure/mailer.service';
import { TelegramService } from '../infrastructure/telegram.service';
import { NotificationConfigService } from '../../notification-config/notification-config.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly mailerService: MailerService,
    private readonly telegramService: TelegramService,
    private readonly configService: NotificationConfigService
  ) {}

  async createNotification(data: { name: string; email: string; message: string }, owner: string) {
    const notification = new this.notificationModel({ ...data, status: 'PENDING' });
    await notification.save();

    try {
      const config = await this.configService.getConfigByEmail(owner);
      if (!config) {
        notification.status = 'FAILED';
        notification.errorMessage = `No hay configuración de notificación para ${data.email}`;
        await notification.save();
        this.logger.error(`❌ ${notification.errorMessage}`);
        return notification;
      }

      this.logger.log(`📨 Enviando notificación a ${data.email} por canales: ${config.channels}`);

      for(const channel of config.channels) {
        switch (channel){
          case 'email':
            await this.mailerService.sendMail(data, config.credentials?.email);
            break;

          case 'telegram':
            await this.telegramService.sendMessage(data, config.credentials?.telegram);
            break;

          default:
            this.logger.warn(`⚠️ Canal desconocido: ${channel}`);
        }
      }
      notification.status = 'SENT';
      await notification.save();
      this.logger.log(`✅ Notificación enviada: ${notification.id}`);
    } catch (err) {
      notification.status = 'FAILED';
      notification.errorMessage = err.message;
      await notification.save();
      this.logger.error(`❌ Error al enviar notificación: ${err.message}`);
    }

    return notification;
  }
}
