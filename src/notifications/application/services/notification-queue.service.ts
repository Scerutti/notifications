import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Notification } from '../../domain/entities/notification.entity';

export interface NotificationQueueService {
  enqueueNotification(notification: Notification, owner: string): Promise<void>;
}

@Injectable()
export class NotificationQueueServiceImpl implements NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueServiceImpl.name);

  constructor(
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue
  ) {}

  async enqueueNotification(notification: Notification, owner: string): Promise<void> {
    this.logger.log(`Enqueuing notification ${notification.id.value} for owner ${owner}`);

    await this.notificationsQueue.add(
      'process-notification',
      {
        notificationId: notification.id.value,
        owner,
        channels: notification.channels.map(c => c.value)
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    this.logger.log(`Notification ${notification.id.value} enqueued successfully`);
  }
}
