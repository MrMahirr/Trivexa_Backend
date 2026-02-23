// Rule violation error
import { DomainError } from './domain-error.base';

export class RuleViolationError extends DomainError {
  readonly code = 'RULE_VIOLATION';
  readonly rule: string;

  constructor(rule: string, message: string) {
    super(message);
    this.rule = rule;
  }
}
