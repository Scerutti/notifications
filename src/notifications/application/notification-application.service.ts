import { Injectable, Logger, Inject } from '@nestjs/common';
import { Notification } from '../domain/entities/notification.entity';
import { NotificationId } from '../domain/value-objects/notification-id.vo';
import { CreateNotificationUseCase, CreateNotificationCommand } from './use-cases/create-notification.use-case';
import { GetNotificationsUseCase, GetNotificationsQuery } from './use-cases/get-notifications.use-case';
import { NotificationRepository } from '../domain/repositories/notification.repository';

@Injectable()
export class NotificationApplicationService {
  private readonly logger = new Logger(NotificationApplicationService.name);

  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository
  ) {}

  async createNotification(command: CreateNotificationCommand): Promise<Notification> {
    this.logger.log(`Creating notification for ${command.email}`);
    return this.createNotificationUseCase.execute(command);
  }

  async getNotifications(query: GetNotificationsQuery) {
    this.logger.log(`Getting notifications with filters: ${JSON.stringify(query)}`);
    return this.getNotificationsUseCase.execute(query);
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    this.logger.log(`Getting notification by ID: ${id}`);
    const notificationId = NotificationId.fromString(id);
    return this.notificationRepository.findById(notificationId);
  }

  async getStats() {
    this.logger.log('Getting notification statistics');
    return this.notificationRepository.getStats();
  }

  async testTelegramConnection() {
    this.logger.log('Testing Telegram connection');
    // This would be implemented in a separate use case
    return {
      success: true,
      message: 'Telegram connection test not implemented in this refactor',
      timestamp: new Date().toISOString()
    };
  }
}
