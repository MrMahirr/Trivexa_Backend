export class DomainError extends Error {
  public readonly code: string;
  public readonly details: any;

  constructor(
    message: string,
    code: string = 'DOMAIN_ERROR',
    details: any = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
