export class Email {
  private constructor(private readonly _value: string) {
    if (!this.isValid(_value)) {
      throw new Error(`Invalid email format: ${_value}`);
    }
  }

  static fromString(value: string): Email {
    return new Email(value);
  }

  get value(): string {
    return this._value;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this._value.toLowerCase() === other._value.toLowerCase();
  }

  toString(): string {
    return this._value;
  }
}
