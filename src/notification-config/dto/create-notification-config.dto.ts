import { IsArray, IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationConfigDto {
  @IsEmail()
  email: string;

  @IsArray()
  @IsString({ each: true })
  channels: string[];

  @IsObject()
  @IsOptional()
  credentials?: Record<string, any>;
}
