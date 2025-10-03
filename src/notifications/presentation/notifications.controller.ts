import { Controller, Post, Get, Body, Query, Param, ParseEnumPipe } from '@nestjs/common';
import { NotificationsService } from '../application/notifications.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationStatus } from '../domain/notification.schema';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una notificación y encolarla para procesamiento' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() dto: CreateNotificationDto,
    @Query("owner") owner: string
  ) {
    return this.notificationsService.createNotification(dto, owner);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de notificaciones con filtros opcionales' })
  @ApiQuery({ name: 'status', enum: NotificationStatus, required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'email', required: false, description: 'Filtrar por email (búsqueda parcial)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginación (default: 0)' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones obtenida exitosamente' })
  findAll(
    @Query('status', new ParseEnumPipe(NotificationStatus, { optional: true })) status?: NotificationStatus,
    @Query('email') email?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.notificationsService.findAll({
      status,
      email,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de notificaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats() {
    return this.notificationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findById(id);
  }
}
