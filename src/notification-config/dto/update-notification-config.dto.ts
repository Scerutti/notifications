import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationConfigDto } from './create-notification-config.dto';

export class UpdateNotificationConfigDto extends PartialType(CreateNotificationConfigDto) {}
