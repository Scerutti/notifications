import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from '../presentation/notifications.controller';
import { NotificationProcessor } from './notification.processor';
import { Notification, NotificationSchema } from '../domain/notification.schema';
import { MailerService } from '../infrastructure/mailer.service';
import { TelegramService } from '../infrastructure/telegram.service';
import { NotificationConfigModule } from '../../notification-config/notification-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationConfigModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor, MailerService, TelegramService],
})
export class NotificationsModule {}
