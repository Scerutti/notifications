import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateNotificationConfigDto {
  @IsEmail()
  email: string;

  @IsArray()
  @IsString({ each: true })
  channels: string[];

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
