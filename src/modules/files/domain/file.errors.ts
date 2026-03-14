import { DomainError, DomainErrorType } from "../../../shared/errors/domain.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";

export class FileNotFoundException extends NotFoundError {
  constructor() {
    super('File not found');
  }
}

export class FileRequiredException extends DomainError {
  constructor() {
    super('File is required', DomainErrorType.BUSINESS_RULE);
  }
}
