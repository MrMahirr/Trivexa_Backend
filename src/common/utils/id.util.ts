import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class IdUtil {
  static generateUuid(): string {
    return uuidv4();
  }

  static isUuid(id: string): boolean {
    return uuidValidate(id);
  }
}
