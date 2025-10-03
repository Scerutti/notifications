import { randomUUID } from 'crypto';

export class NotificationId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('NotificationId cannot be empty');
    }
  }

  static create(): NotificationId {
    return new NotificationId(randomUUID());
  }

  static fromString(value: string): NotificationId {
    return new NotificationId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: NotificationId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
