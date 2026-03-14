import { DomainError, DomainErrorType } from "../../../shared/errors/domain.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";

export class ContractNotFoundException extends NotFoundError {
  constructor() {
    super('Contract not found');
  }
}

export class InvalidContractDateException extends DomainError {
  constructor() {
    super('End date must be after start date', DomainErrorType.BUSINESS_RULE);
  }
}

export class InvalidContractStatusException extends DomainError {
  constructor(message: string) {
    super(message, DomainErrorType.BUSINESS_RULE);
  }
}
