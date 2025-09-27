import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationConfigController } from './notification-config.controller';
import { NotificationConfigService } from './notification-config.service';
import { NotificationConfig, NotificationConfigSchema } from './schemas/notification-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationConfig.name, schema: NotificationConfigSchema },
    ]),
  ],
  controllers: [NotificationConfigController],
  providers: [NotificationConfigService],
  exports: [NotificationConfigService],
})
export class NotificationConfigModule {}
