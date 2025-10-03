import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NotificationDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    type: String, 
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING' 
  })
  status: string;

  @Prop({ 
    type: [String], 
    enum: ['email', 'telegram'],
    default: ['email'] 
  })
  channels: string[];

  @Prop()
  errorMessage?: string;

  @Prop()
  sentAt?: Date;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationDocument);
