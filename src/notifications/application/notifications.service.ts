import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../domain/notification.schema';
import { MailerService } from '../infrastructure/mailer.service';
import { TelegramService } from '../infrastructure/telegram.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly mailerService: MailerService,
    private readonly telegramService: TelegramService,
  ) {}

  async createNotification(data: { name: string; email: string; message: string }) {
    const notification = new this.notificationModel({ ...data, status: 'PENDING' });
    await notification.save();

    try {
      // enviar mail
      await this.mailerService.sendMail(data);
      // enviar telegram
      await this.telegramService.sendMessage(data);

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
