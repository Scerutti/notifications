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
import { TelegramService } from '../infrastructure/telegram.service';
import {toString} from "funciones-basicas"

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
    private readonly configService: NotificationConfigService,
    private readonly telegramService: TelegramService
  ) {}

  async createNotification(dto: CreateNotificationDto, owner: string): Promise<Notification> {
    // Obtener configuración del owner primero
    const config = await this.configService.getConfigByEmail(owner);
    if (!config) {
      throw new Error(`No hay configuración de notificación para el owner: ${owner}`);
    }

    // Crear notificación en estado PENDING
    const notification = new this.notificationModel({
      ...dto,
      status: NotificationStatus.PENDING,
      channels: config.channels,
      retryCount: 0,
      metadata: dto.metadata ?? {}
    });

    await notification.save();
    this.logger.log(`📝 Notificación creada con ID: ${toString(notification._id)} en estado PENDING`);

    // Encolar job para procesamiento asíncrono
    await this.notificationsQueue.add(
      'process-notification',
      {
        notificationId: toString(notification._id),
        owner,
        channels: notification.channels,
        // Ya no pasamos config, usaremos process.env directamente en el processor
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

    this.logger.log(`🚀 Notificación ${toString(notification._id)} encolada para procesamiento`);
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

  async testTelegramConnection() {
    try {
      this.logger.log('🧪 Iniciando prueba de conexión con Telegram...');
      
      // Verificar variables de entorno
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      this.logger.log(`🔍 Token configurado: ${token ? '✅ Sí' : '❌ No'}`);
      this.logger.log(`🔍 Chat ID configurado: ${chatId ? '✅ Sí' : '❌ No'}`);
      
      if (!token || !chatId) {
        return {
          success: false,
          error: 'Variables de entorno TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configuradas',
          tokenConfigured: !!token,
          chatIdConfigured: !!chatId
        };
      }

      // Obtener información del bot
      const botInfo = await this.telegramService.getBotInfo();
      this.logger.log(`🤖 Bot info: ${JSON.stringify(botInfo)}`);

      // Enviar mensaje de prueba
      await this.telegramService.sendMessage({
        name: 'Sistema de Notificaciones',
        email: 'test@example.com',
        message: '🧪 Mensaje de prueba - Conexión exitosa con Telegram'
      });

      return {
        success: true,
        message: 'Conexión con Telegram exitosa',
        botInfo: botInfo,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`❌ Error en prueba de Telegram: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
