import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

// Domain
import { NotificationDomainServiceImpl } from './domain/services/notification-domain.service';

// Application
import { NotificationApplicationService } from './application/notification-application.service';
import { NotificationsService } from './application/notifications.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { NotificationQueueServiceImpl } from './application/services/notification-queue.service';

// Infrastructure
import { MongooseNotificationRepository } from './infrastructure/repositories/mongoose-notification.repository';
import { NotificationSchema } from './infrastructure/schemas/notification.schema';
import { MailerService } from './infrastructure/mailer.service';
import { TelegramService } from './infrastructure/telegram.service';
import { NotificationProcessor } from './application/notification.processor';

// Presentation
import { NotificationsController } from './presentation/notifications.controller';

// External
import { NotificationConfigModule } from '../notification-config/notification-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema }
    ]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationConfigModule
  ],
  controllers: [NotificationsController],
  providers: [
    // Domain Services
    {
      provide: 'NotificationDomainService',
      useClass: NotificationDomainServiceImpl
    },
    
    // Repositories
    {
      provide: 'NotificationRepository',
      useClass: MongooseNotificationRepository
    },
    
    // Application Services
    {
      provide: 'NotificationQueueService',
      useClass: NotificationQueueServiceImpl
    },
    
    // Use Cases
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    
    // Application Service
    NotificationApplicationService,
    NotificationsService,
    
    // Infrastructure Services
    MailerService,
    TelegramService,
    
    // Processor
    NotificationProcessor
  ],
  exports: [NotificationApplicationService]
})
export class NotificationsModule {}
