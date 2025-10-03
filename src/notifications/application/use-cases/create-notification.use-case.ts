import { Injectable, Logger, Inject } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { NotificationMessage } from '../../domain/value-objects/notification-message.vo';
import { NotificationChannel } from '../../domain/value-objects/notification-status.vo';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationDomainService } from '../../domain/services/notification-domain.service';
import { NotificationQueueService } from '../services/notification-queue.service';
import { NotificationConfigService } from '../../../notification-config/notification-config.service';

export interface CreateNotificationCommand {
  name: string;
  email: string;
  message: string;
  metadata?: Record<string, any>;
  owner: string;
}

@Injectable()
export class CreateNotificationUseCase {
  private readonly logger = new Logger(CreateNotificationUseCase.name);

  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,
    @Inject('NotificationDomainService')
    private readonly domainService: NotificationDomainService,
    @Inject('NotificationQueueService')
    private readonly queueService: NotificationQueueService,
    private readonly configService: NotificationConfigService
  ) {}

  async execute(command: CreateNotificationCommand): Promise<Notification> {
    this.logger.log(`Creating notification for ${command.email}`);

    // Validate input
    const email = Email.fromString(command.email);
    const message = NotificationMessage.fromString(command.message);

    // Check if owner has configuration and get active channels
    const config = await this.configService.getConfigByEmail(command.owner);
    if (!config?.enabled) {
      throw new Error(`No notification configuration found for owner: ${command.owner}`);
    }

    // Use channels from owner's configuration, not from DTO
    const channels = this.mapChannels(config.channels);

    // Validate channels
    if (!this.domainService.validateChannels(channels)) {
      throw new Error('Invalid notification channels in owner configuration');
    }

    // Create notification
    const notification = Notification.create(
      NotificationId.create(),
      command.name,
      email,
      message,
      channels,
      command.metadata || {}
    );

    // Save to repository
    const savedNotification = await this.notificationRepository.save(notification);

    // Enqueue for processing
    await this.queueService.enqueueNotification(savedNotification, command.owner);

    this.logger.log(`Notification ${savedNotification.id.value} created and enqueued`);
    
    return savedNotification;
  }

  private mapChannels(channelStrings: string[]): NotificationChannel[] {
    return channelStrings.map(channel => NotificationChannel.fromString(channel));
  }
}
