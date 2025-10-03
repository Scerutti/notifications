import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from './notifications/application/notifications.module';
import { HealthController } from './app.controller';
import { NotificationConfigModule } from './notification-config/notification-config.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT || 6379),
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
      }
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationsModule,
    NotificationConfigModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
