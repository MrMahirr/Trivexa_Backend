import { BaseDbEntity } from './base.interface';

export interface UserDb extends BaseDbEntity {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login_at?: Date;
}
