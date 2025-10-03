import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NotificationConfig extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [String], default: ['email'] })
  channels: string[];

  @Prop({ default: true })
  enabled: boolean;
}

export const NotificationConfigSchema = SchemaFactory.createForClass(NotificationConfig);
