import { Notification } from '../entities/notification.entity';
import { NotificationChannel } from '../value-objects/notification-status.vo';

export interface NotificationDomainService {
  validateChannels(channels: NotificationChannel[]): boolean;
  calculateRetryDelay(retryCount: number): number;
  shouldRetry(notification: Notification, maxRetries: number): boolean;
}

export class NotificationDomainServiceImpl implements NotificationDomainService {
  validateChannels(channels: NotificationChannel[]): boolean {
    if (!channels || channels.length === 0) {
      return false;
    }
    
    const validChannels = ['email', 'telegram'];
    return channels.every(channel => validChannels.includes(channel.value));
  }

  calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount * 1000ms
    return Math.pow(2, retryCount) * 1000;
  }

  shouldRetry(notification: Notification, maxRetries: number): boolean {
    return notification.isFailed() && 
           notification.retryCount < maxRetries &&
           notification.retryCount < 5; // Hard limit
  }
}
