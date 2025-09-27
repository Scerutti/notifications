import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from './notifications/application/notifications.module';
import { HealthController } from './app.controller';
import { NotificationConfigModule } from './notification-config/notification-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    NotificationsModule,
    NotificationConfigModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
