import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus, NotificationChannel } from '../domain/notification.schema';

export class NotificationResponseDto {
  @ApiProperty({ 
    description: 'ID único de la notificación',
    example: '64a1b2c3d4e5f6789012345'
  })
  _id: string;

  @ApiProperty({ 
    description: 'Nombre del destinatario',
    example: 'Juan Pérez'
  })
  name: string;

  @ApiProperty({ 
    description: 'Email del destinatario',
    example: 'juan@example.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Mensaje de la notificación',
    example: 'Hola, tienes una nueva notificación importante'
  })
  message: string;

  @ApiProperty({ 
    description: 'Estado actual de la notificación',
    enum: NotificationStatus,
    example: NotificationStatus.SENT
  })
  status: NotificationStatus;

  @ApiProperty({ 
    description: 'Canales por los que se envió la notificación',
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.EMAIL, NotificationChannel.TELEGRAM]
  })
  channels: NotificationChannel[];

  @ApiProperty({ 
    description: 'Mensaje de error si falló el envío',
    example: null,
    required: false
  })
  errorMessage?: string;

  @ApiProperty({ 
    description: 'Fecha y hora de envío exitoso',
    example: '2025-01-10T01:53:41.000Z',
    required: false
  })
  sentAt?: Date;

  @ApiProperty({ 
    description: 'Número de reintentos realizados',
    example: 0
  })
  retryCount: number;

  @ApiProperty({ 
    description: 'Metadatos adicionales',
    example: { priority: 'high', category: 'alert' },
    required: false
  })
  metadata?: Record<string, any>;

  @ApiProperty({ 
    description: 'Fecha de creación',
    example: '2025-01-10T01:53:41.000Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Fecha de última actualización',
    example: '2025-01-10T01:53:41.000Z'
  })
  updatedAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ 
    description: 'Lista de notificaciones',
    type: [NotificationResponseDto]
  })
  data: NotificationResponseDto[];

  @ApiProperty({ 
    description: 'Total de notificaciones que coinciden con los filtros',
    example: 25
  })
  total: number;

  @ApiProperty({ 
    description: 'Límite de resultados por página',
    example: 50
  })
  limit: number;

  @ApiProperty({ 
    description: 'Offset para paginación',
    example: 0
  })
  offset: number;
}

export class NotificationStatsResponseDto {
  @ApiProperty({ 
    description: 'Total de notificaciones',
    example: 150
  })
  total: number;

  @ApiProperty({ 
    description: 'Estadísticas por estado',
    example: {
      pending: 5,
      sent: 140,
      failed: 5
    }
  })
  status: {
    pending: number;
    sent: number;
    failed: number;
  };

  @ApiProperty({ 
    description: 'Estadísticas por canal',
    example: {
      email: [{ _id: 'SENT', count: 120 }, { _id: 'FAILED', count: 3 }],
      telegram: [{ _id: 'SENT', count: 20 }, { _id: 'FAILED', count: 2 }]
    }
  })
  channels: {
    email: Array<{ _id: string; count: number }>;
    telegram: Array<{ _id: string; count: number }>;
  };

  @ApiProperty({ 
    description: 'Notificaciones recientes (últimas 24 horas)',
    example: {
      last24Hours: 12
    }
  })
  recent: {
    last24Hours: number;
  };

  @ApiProperty({ 
    description: 'Tasa de éxito en porcentaje',
    example: '93.33'
  })
  successRate: string;
}
