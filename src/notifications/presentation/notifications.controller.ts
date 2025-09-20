import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from '../application/notifications.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

class CreateNotificationDto {
  name: string;
  email: string;
  message: string;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una notificación (email + telegram)' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(dto);
  }
}
