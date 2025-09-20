import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  errorMessage?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
