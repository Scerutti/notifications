export class NotificationMessage {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('Notification message cannot be empty');
    }
    if (_value.length > 1000) {
      throw new Error('Notification message cannot exceed 1000 characters');
    }
  }

  static fromString(value: string): NotificationMessage {
    return new NotificationMessage(value);
  }

  get value(): string {
    return this._value;
  }

  get length(): number {
    return this._value.length;
  }

  equals(other: NotificationMessage): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
