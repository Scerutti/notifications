import { NotificationStatus, NotificationChannel } from '../value-objects/notification-status.vo';
import { NotificationId } from '../value-objects/notification-id.vo';
import { Email } from '../value-objects/email.vo';
import { NotificationMessage } from '../value-objects/notification-message.vo';

export class Notification {
  private constructor(
    private readonly _id: NotificationId,
    private readonly _name: string,
    private readonly _email: Email,
    private readonly _message: NotificationMessage,
    private _status: NotificationStatus,
    private readonly _channels: NotificationChannel[],
    private _errorMessage?: string,
    private _sentAt?: Date,
    private _retryCount: number = 0,
    private readonly _metadata: Record<string, any> = {},
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  static create(
    id: NotificationId,
    name: string,
    email: Email,
    message: NotificationMessage,
    channels: NotificationChannel[],
    metadata: Record<string, any> = {}
  ): Notification {
    return new Notification(
      id,
      name,
      email,
      message,
      NotificationStatus.PENDING,
      channels,
      undefined,
      undefined,
      0,
      metadata
    );
  }

  static fromPersistence(data: any): Notification {
    return new Notification(
      NotificationId.fromString(data._id.toString()),
      data.name,
      Email.fromString(data.email),
      NotificationMessage.fromString(data.message),
      NotificationStatus.fromString(data.status),
      data.channels.map((c: string) => NotificationChannel.fromString(c)),
      data.errorMessage,
      data.sentAt ? new Date(data.sentAt) : undefined,
      data.retryCount ?? 0,
      data.metadata ?? {},
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  // Getters
  get id(): NotificationId { return this._id; }
  get name(): string { return this._name; }
  get email(): Email { return this._email; }
  get message(): NotificationMessage { return this._message; }
  get status(): NotificationStatus { return this._status; }
  get channels(): NotificationChannel[] { return [...this._channels]; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get sentAt(): Date | undefined { return this._sentAt; }
  get retryCount(): number { return this._retryCount; }
  get metadata(): Record<string, any> { return { ...this._metadata }; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business methods
  markAsSent(): void {
    this._status = NotificationStatus.SENT;
    this._sentAt = new Date();
    this._updatedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this._status = NotificationStatus.FAILED;
    this._errorMessage = errorMessage;
    this._retryCount++;
    this._updatedAt = new Date();
  }

  canRetry(maxRetries: number = 3): boolean {
    return this._retryCount < maxRetries && this._status === NotificationStatus.FAILED;
  }

  isPending(): boolean {
    return this._status === NotificationStatus.PENDING;
  }

  isSent(): boolean {
    return this._status === NotificationStatus.SENT;
  }

  isFailed(): boolean {
    return this._status === NotificationStatus.FAILED;
  }

  // Serialization for persistence
  toPersistence(): any {
    return {
      _id: this._id.value,
      name: this._name,
      email: this._email.value,
      message: this._message.value,
      status: this._status.value,
      channels: this._channels.map(c => c.value),
      errorMessage: this._errorMessage,
      sentAt: this._sentAt,
      retryCount: this._retryCount,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
