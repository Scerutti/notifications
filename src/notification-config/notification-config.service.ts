import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationConfig } from './schemas/notification-config.schema';
import { CreateNotificationConfigDto } from './dto/create-notification-config.dto';
import { UpdateNotificationConfigDto } from './dto/update-notification-config.dto';

@Injectable()
export class NotificationConfigService {
  constructor(
    @InjectModel(NotificationConfig.name)
    private readonly configModel: Model<NotificationConfig>,
  ) {}

  async createConfig(dto: CreateNotificationConfigDto): Promise<NotificationConfig> {
    const config = new this.configModel(dto);
    return config.save();
  }

  async updateConfig(email: string, dto: UpdateNotificationConfigDto): Promise<NotificationConfig> {
    const config = await this.configModel.findOneAndUpdate({ email }, dto, { new: true });
    if (!config) throw new NotFoundException(`Config not found for email: ${email}`);
    return config;
  }

  async getConfigByEmail(email: string): Promise<NotificationConfig> {
    const config = await this.configModel.findOne({ email });
    if (!config) throw new NotFoundException(`Config not found for email: ${email}`);
    return config;
  }
}
