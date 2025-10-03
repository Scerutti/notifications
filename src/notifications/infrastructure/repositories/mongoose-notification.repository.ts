import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { NotificationRepository, NotificationFilters, NotificationStats } from '../../domain/repositories/notification.repository';

@Injectable()
export class MongooseNotificationRepository implements NotificationRepository {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<any>
  ) {}

  async save(notification: Notification): Promise<Notification> {
    const data = notification.toPersistence();
    // Remove _id to let MongoDB generate it
    delete data._id;
    const saved = await this.notificationModel.create(data);
    return Notification.fromPersistence(saved);
  }

  async findById(id: NotificationId): Promise<Notification | null> {
    const doc = await this.notificationModel.findById(id.value).exec();
    return doc ? Notification.fromPersistence(doc) : null;
  }

  async findByEmail(email: Email): Promise<Notification[]> {
    const docs = await this.notificationModel.find({ email: email.value }).exec();
    return docs.map(doc => Notification.fromPersistence(doc));
  }

  async findAll(filters: NotificationFilters): Promise<{
    data: Notification[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const query: any = {};
    
    if (filters.status) {
      query.status = filters.status.value;
    }
    
    if (filters.email) {
      query.email = { $regex: filters.email.value, $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit ?? 50)
        .skip(filters.offset ?? 0)
        .exec(),
      this.notificationModel.countDocuments(query)
    ]);

    return {
      data: docs.map(doc => Notification.fromPersistence(doc)),
      total,
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0
    };
  }

  async getStats(): Promise<NotificationStats> {
    const total = await this.notificationModel.countDocuments();
    const pending = await this.notificationModel.countDocuments({ status: 'PENDING' });
    const sent = await this.notificationModel.countDocuments({ status: 'SENT' });
    const failed = await this.notificationModel.countDocuments({ status: 'FAILED' });

    const emailStats = await this.notificationModel.aggregate([
      { $match: { channels: 'email' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const telegramStats = await this.notificationModel.aggregate([
      { $match: { channels: 'telegram' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNotifications = await this.notificationModel.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    return {
      total,
      status: { pending, sent, failed },
      channels: {
        email: emailStats,
        telegram: telegramStats
      },
      recent: { last24Hours: recentNotifications },
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0'
    };
  }

  async findPendingNotifications(): Promise<Notification[]> {
    const docs = await this.notificationModel.find({ status: 'PENDING' }).exec();
    return docs.map(doc => Notification.fromPersistence(doc));
  }

  async findFailedNotificationsWithRetries(): Promise<Notification[]> {
    const docs = await this.notificationModel.find({ 
      status: 'FAILED',
      retryCount: { $lt: 3 }
    }).exec();
    return docs.map(doc => Notification.fromPersistence(doc));
  }
}
