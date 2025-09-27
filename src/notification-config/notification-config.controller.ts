import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { NotificationConfigService } from './notification-config.service';
import { CreateNotificationConfigDto } from './dto/create-notification-config.dto';
import { UpdateNotificationConfigDto } from './dto/update-notification-config.dto';

@Controller('config/notifications')
export class NotificationConfigController {
  constructor(private readonly configService: NotificationConfigService) {}

  @Post()
  async createConfig(@Body() dto: CreateNotificationConfigDto) {
    return this.configService.createConfig(dto);
  }

  @Put(':email')
  async updateConfig(@Param('email') email: string, @Body() dto: UpdateNotificationConfigDto) {
    return this.configService.updateConfig(email, dto);
  }

  @Get(':email')
  async getConfig(@Param('email') email: string) {
    return this.configService.getConfigByEmail(email);
  }
}
