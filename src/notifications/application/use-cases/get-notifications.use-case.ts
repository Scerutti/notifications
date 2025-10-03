import { Injectable, Inject } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationStatus } from '../../domain/value-objects/notification-status.vo';
import { Email } from '../../domain/value-objects/email.vo';

export interface GetNotificationsQuery {
  status?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

export interface GetNotificationsResult {
  data: Notification[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(query: GetNotificationsQuery): Promise<GetNotificationsResult> {
    const filters = {
      status: query.status ? NotificationStatus.fromString(query.status) : undefined,
      email: query.email ? Email.fromString(query.email) : undefined,
      limit: query.limit || 50,
      offset: query.offset || 0
    };

    return this.notificationRepository.findAll(filters);
  }
}
