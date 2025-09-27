import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from '../presentation/notifications.controller';
import { Notification, NotificationSchema } from '../domain/notification.schema';
import { MailerService } from '../infrastructure/mailer.service';
import { TelegramService } from '../infrastructure/telegram.service';
import { NotificationConfigModule } from '../../notification-config/notification-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    NotificationConfigModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, MailerService, TelegramService],
})
export class NotificationsModule {}
