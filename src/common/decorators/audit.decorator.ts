import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export const Audit = (resource: string, action?: string) => SetMetadata(AUDIT_KEY, { resource, action });
