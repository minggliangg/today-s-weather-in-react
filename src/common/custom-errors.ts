export class NetworkError extends Error {
  private static readonly ERROR_NAME = 'NetworkError';

  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = NetworkError.ERROR_NAME;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class InvalidLocationError extends Error {
  private static readonly ERROR_NAME = 'InvalidLocationError';

  constructor(message: string) {
    super(message);
    this.name = InvalidLocationError.ERROR_NAME;
    Object.setPrototypeOf(this, InvalidLocationError.prototype);
  }
}
