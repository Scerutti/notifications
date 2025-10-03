import { Notification } from '../entities/notification.entity';
import { NotificationId } from '../value-objects/notification-id.vo';
import { Email } from '../value-objects/email.vo';
import { NotificationStatus } from '../value-objects/notification-status.vo';

export interface NotificationFilters {
  status?: NotificationStatus;
  email?: Email;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  status: {
    pending: number;
    sent: number;
    failed: number;
  };
  channels: {
    email: Array<{ status: string; count: number }>;
    telegram: Array<{ status: string; count: number }>;
  };
  recent: {
    last24Hours: number;
  };
  successRate: string;
}

export interface NotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: NotificationId): Promise<Notification | null>;
  findByEmail(email: Email): Promise<Notification[]>;
  findAll(filters: NotificationFilters): Promise<{
    data: Notification[];
    total: number;
    limit: number;
    offset: number;
  }>;
  getStats(): Promise<NotificationStats>;
  findPendingNotifications(): Promise<Notification[]>;
  findFailedNotificationsWithRetries(): Promise<Notification[]>;
}
