export enum DomainErrorType {
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BUSINESS_RULE = 'BUSINESS_RULE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class DomainError extends Error {
  public readonly code: string;
  public readonly type: DomainErrorType;

  constructor(message: string, type: DomainErrorType = DomainErrorType.BUSINESS_RULE, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
