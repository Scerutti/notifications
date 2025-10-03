import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Nombre del destinatario', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email del destinatario', example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mensaje de la notificación', example: 'Hola, tienes una nueva notificación' })
  @IsString()
  @IsNotEmpty()
  message: string;


  @ApiProperty({ 
    description: 'Metadatos adicionales', 
    example: { priority: 'high', category: 'alert' },
    required: false 
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

