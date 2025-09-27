import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NotificationConfig extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [String], default: [] })
  channels: string[];

  @Prop({ type: Object, default: {} })
  credentials: Record<string, any>;
}

export const NotificationConfigSchema = SchemaFactory.createForClass(NotificationConfig);
