import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Model } from 'mongoose';
import { Queue } from 'bullmq';
import { 
  Notification, 
  NotificationStatus, 
  NotificationChannel 
} from '../domain/notification.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationConfigService } from '../../notification-config/notification-config.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
    private readonly configService: NotificationConfigService
  ) {}

  async createNotification(dto: CreateNotificationDto, owner: string): Promise<Notification> {
    // Crear notificación en estado PENDING
    const notification = new this.notificationModel({
      ...dto,
      status: NotificationStatus.PENDING,
      channels: dto.channels ?? [NotificationChannel.EMAIL],
      retryCount: 0,
      metadata: dto.metadata ?? {}
    });

    await notification.save();
    this.logger.log(`📝 Notificación creada con ID: ${notification._id.toString()} en estado PENDING`);

    // Obtener configuración del owner
    const config = await this.configService.getConfigByEmail(owner);
    if (!config) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = `No hay configuración de notificación para el owner: ${owner}`;
      await notification.save();
      this.logger.error(`❌ ${notification.errorMessage}`);
      return notification;
    }

    // Encolar job para procesamiento asíncrono
    await this.notificationsQueue.add(
      'process-notification',
      {
        notificationId: notification._id.toString(),
        owner,
        channels: notification.channels,
        config: {
          email: config.credentials?.email,
          telegram: config.credentials?.telegram
        }
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

    this.logger.log(`🚀 Notificación ${notification._id.toString()} encolada para procesamiento`);
    return notification;
  }

  async findAll(filters?: {
    status?: NotificationStatus;
    email?: string;
    limit?: number;
    offset?: number;
  }) {
    const query: any = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.email) {
      query.email = { $regex: filters.email, $options: 'i' };
    }

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 50)
      .skip(filters?.offset || 0)
      .exec();

    const total = await this.notificationModel.countDocuments(query);

    return {
      data: notifications,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0
    };
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notificationModel.findById(id).exec();
  }

  async getStats() {
    const total = await this.notificationModel.countDocuments();
    const pending = await this.notificationModel.countDocuments({ status: NotificationStatus.PENDING });
    const sent = await this.notificationModel.countDocuments({ status: NotificationStatus.SENT });
    const failed = await this.notificationModel.countDocuments({ status: NotificationStatus.FAILED });

    // Estadísticas por canal
    const emailStats = await this.notificationModel.aggregate([
      { $match: { channels: 'email' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const telegramStats = await this.notificationModel.aggregate([
      { $match: { channels: 'telegram' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Últimas 24 horas
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNotifications = await this.notificationModel.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    return {
      total,
      status: {
        pending,
        sent,
        failed
      },
      channels: {
        email: emailStats,
        telegram: telegramStats
      },
      recent: {
        last24Hours: recentNotifications
      },
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0'
    };
  }
}
