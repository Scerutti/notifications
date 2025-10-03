import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
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

  @Put(':id')
  async updateConfig(@Param('id') id: string, @Body() dto: UpdateNotificationConfigDto) {
    return this.configService.updateConfigById(id, dto);
  }

  @Get('by-email')
  async getConfigByEmail(@Query('email') email: string) {
    return this.configService.getConfigByEmail(email);
  }

  @Get(':id')
  async getConfig(@Param('id') id: string) {
    return this.configService.getConfigById(id);
  }
}
