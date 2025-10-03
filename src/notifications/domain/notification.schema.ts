import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export enum NotificationChannel {
  EMAIL = 'email',
  TELEGRAM = 'telegram'
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING 
  })
  status: NotificationStatus;

  @Prop({ 
    type: [String], 
    enum: Object.values(NotificationChannel),
    default: [NotificationChannel.EMAIL] 
  })
  channels: NotificationChannel[];

  @Prop()
  errorMessage?: string;

  @Prop()
  sentAt?: Date;

  @Prop()
  retryCount: number;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
