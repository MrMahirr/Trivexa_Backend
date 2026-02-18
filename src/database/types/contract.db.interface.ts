import { BaseDbEntity } from './base.interface';
import { ContractStatus } from '../../shared/enums/contract-status.enum';

export interface ContractDb extends BaseDbEntity {
    client_id: string;
    title: string;
    description?: string;
    status: ContractStatus;
    start_date: Date;
    end_date?: Date;
    value?: number;
    signed_url?: string;
    created_by?: string;
}
