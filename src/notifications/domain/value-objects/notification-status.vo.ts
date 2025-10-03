export enum NotificationStatusValue {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export class NotificationStatus {
  private constructor(private readonly _value: NotificationStatusValue) {}

  static readonly PENDING = new NotificationStatus(NotificationStatusValue.PENDING);
  static readonly SENT = new NotificationStatus(NotificationStatusValue.SENT);
  static readonly FAILED = new NotificationStatus(NotificationStatusValue.FAILED);

  static fromString(value: string): NotificationStatus {
    switch (value) {
      case NotificationStatusValue.PENDING:
        return NotificationStatus.PENDING;
      case NotificationStatusValue.SENT:
        return NotificationStatus.SENT;
      case NotificationStatusValue.FAILED:
        return NotificationStatus.FAILED;
      default:
        throw new Error(`Invalid notification status: ${value}`);
    }
  }

  get value(): NotificationStatusValue {
    return this._value;
  }

  equals(other: NotificationStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  isPending(): boolean {
    return this._value === NotificationStatusValue.PENDING;
  }

  isSent(): boolean {
    return this._value === NotificationStatusValue.SENT;
  }

  isFailed(): boolean {
    return this._value === NotificationStatusValue.FAILED;
  }
}

export class NotificationChannel {
  private constructor(private readonly _value: string) {
    if (!['email', 'telegram'].includes(_value)) {
      throw new Error(`Invalid notification channel: ${_value}`);
    }
  }

  static readonly EMAIL = new NotificationChannel('email');
  static readonly TELEGRAM = new NotificationChannel('telegram');

  static fromString(value: string): NotificationChannel {
    return new NotificationChannel(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: NotificationChannel): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  isEmail(): boolean {
    return this._value === 'email';
  }

  isTelegram(): boolean {
    return this._value === 'telegram';
  }
}
